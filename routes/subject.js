const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Classroom = require("../models/classroom.js");
const Subject = require("../models/subject.js");
const Schema = mongoose.Schema;
const Folder = require("../models/folder.js");
const { isLogggedIn, saveRedirectUrl } = require("../middleware.js");

router.post("/create/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let { subjectName } = req.body;
    let insertIntoClassroom = await Classroom.findById(id).populate("subject");
    let classData = insertIntoClassroom;
    let newSubject = new Subject({ username: subjectName, classroom: id });
    insertIntoClassroom.subject.push(newSubject._id);
    await insertIntoClassroom.save();
    await newSubject.save();
    let updatedClassroom = await Classroom.findById(id).populate("subject");
    req.session.classData = updatedClassroom;

    // Redirect to another route
    res.redirect("/classroom/enter");
  } catch (e) {
    req.flash("error", e.message);

    console.log(e.message);
  }
});

router.get("/:id", async (req, res) => {

  try {
      let { id } = req.params;
  let subject = await Subject.findById(id);
  await subject.populate("folder");
  console.log("\n\n\n\n");
  
  res.render("./classroom/subject.ejs", { subject });
  } catch (e) {
    console.log(e.message);
  }
});

//delete route
router.delete("/delete/:id", async (req, res) => {
  let { id } = req.params;
  let subject = await Subject.findById(id);
  let classroom = await Classroom.findById(subject.classroom).populate(
    "subject"
  );
  classroom.subject = classroom.subject.filter(
    (sub) => sub._id.toString() !== id
  );
  await classroom.save();
  await Subject.deleteOne({ _id: id });
  req.session.classData = classroom;

  // Redirect to another route
  res.redirect("/classroom/enter");
});
module.exports = router;
