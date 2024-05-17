const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Classroom = require("../models/classroom.js");
const Subject = require("../models/subject.js");
const Schema = mongoose.Schema;
const Folder = require("../models/folder.js");
const { isLogggedIn, saveRedirectUrl } = require("../middleware.js");
const cloudinary = require("cloudinary").v2;
router.post("/create/:id", isLogggedIn,async (req, res) => {
  try {
    let { id } = req.params;
    let { subjectName } = req.body;
    let insertIntoClassroom = await Classroom.findById(id).populate("subject");
    let newSubject = new Subject({ username: subjectName, classroom: id });
    insertIntoClassroom.subject.push(newSubject._id);
    newSubject.author = res.locals.currUser.username;
    await insertIntoClassroom.save();
    await newSubject.save();
    let updatedClassroom = await Classroom.findById(id).populate("subject");
    req.session.classData = updatedClassroom;
    res.redirect("/classroom/enter");
  } catch (e) {
    req.flash("error", e.message);
  }
});

router.get("/:id", isLogggedIn,async (req, res) => {
  try {
    let { id } = req.params;
    let subject = await Subject.findById(id);
    await subject.populate("folder");
    res.render("./classroom/subject.ejs", { subject });
  } catch (e) {
    console.log(e.message);
  }
});
async function deleteFolderFiles(id) {
  try {
    let folder = await Folder.findById(id).populate("subject");
    if (!folder) {
      throw new Error(`Folder with id ${id} not found`);
    }
    let subject = await Subject.findById(folder.subject);
    if (!subject) {
      throw new Error(`Subject for folder id ${id} not found`);
    }

    subject.folder = subject.folder.filter((folder) => !folder._id.equals(id));

    await subject.save();
    for (let i of folder.image) {
      cloudinary.uploader
        .destroy(i.originalName)
        .then((result) => console.log(result));
      await Folder.deleteOne({ _id: id });
    }
  } catch (e) {
    console.log(e.message);
  }
}

//delete route
router.delete("/delete/:id", isLogggedIn, async (req, res) => {
  let { id } = req.params;
  let { name } = req.body;
  let subject = await Subject.findById(id).populate("folder");
  try {
    if (!subject) {
      req.flash("error", "Subject not found!");
      return res.redirect("/classroom");
    }

    if (name !== subject.username) {
      req.flash("error", `Incorrect Name !`);
      return res.redirect(`/subject/${id}`);
    }
    for (let i of subject.folder) {
      await deleteFolderFiles(i._id);
    }

    let classroom = await Classroom.findById(subject.classroom).populate(
      "subject"
    );
    classroom.subject = classroom.subject.filter(
      (sub) => sub._id.toString() !== id
    );

    await classroom.save();
    await Subject.deleteOne({ _id: id });
    req.session.classData = classroom;

    req.flash("success", "Subject and its folders deleted successfully!");

    res.redirect("/classroom/enter");
    console.log(`Subject ${name} deleted by ${res.locals.currUser.username}`);
  } catch (e) {
    req.flash("error", "An error occurred while deleting the subject.");
    res.redirect("/classroom/enter");
  }
});

//bulk delete of folders

//Back route
router.get("/back/:id", isLogggedIn, async (req, res) => {
  let { id } = req.params;
  let subject = await Subject.findById(id).populate("classroom");
  let classroom = await Classroom.findById(subject.classroom._id).populate("subject");
  req.session.classData = classroom;

  res.redirect("/classroom/enter");
});
module.exports = router;
