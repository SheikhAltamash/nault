const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Classroom = require("../models/classroom.js");
const Subject = require("../models/subject.js");
const Schema = mongoose.Schema;
const Folder = require("../models/folder.js");
const { isLogggedIn, saveRedirectUrl } = require("../middleware.js");
const { route } = require("./subject.js");
const multer = require("multer");
const { cloudinary, storage } = require("../cloudImage.js");
const upload = multer({ storage });
const {notify}=require("../public/js/mail.js")
router.get("/", function (req, res) {
  res.render("./classroom/folder.ejs");
});
var fs = require("fs");
const subject = require("../models/subject.js");
router.post("/getdata", (req, res) => {
  let { data }=req.body;
  console.log("Data comes to server");
  console.log(data);
});
router.post(
  "/upload/:id",
  isLogggedIn,
  upload.single("image"),
  async (req, res) => {
    try {
      let url = req.file.path;
      let { name } = req.body;
      let filename = name || req.file.originalname;

      let { id } = req.params;
      let author = res.locals.currUser.username;
      let folder = await Folder.findById(id);
      let originalName = req.file.filename;
      folder.image.push({ url, filename, author, originalName });
      await folder.save();
      req.flash("success", "File Uploaded Successfully !!!");
      res.redirect(`/folder/enter/${folder._id}`);

      let subject = await Subject.findById(folder.subject);
      let classroom = await Classroom.findById(subject.classroom).populate(
        "student"
      );

      // Extract all student emails
      let emailAddresses = classroom.student
        .filter((student) => res.locals.currUser.username !== student.username)
        .map((student) => student.email)
        .join(",");

      await notify(
        res.locals.currUser.username,
        classroom.username, // assuming classroom has a 'name' property
        emailAddresses,
        filename,
        folder.name,
        subject.username,
        folder._id
      );
    } catch (e) {
      req.flash("error", "Failed to upload file !!!");
      console.log(e.message);
    }
  }
);

router.post("/subject/folder/:id", isLogggedIn, async (req, res) => {
  let { id } = req.params;
  let { name } = req.body;
  let newFolder = await new Folder({ name: name, subject: id });
  let subject = await Subject.findById(id).populate("folder");
  subject.folder.push(newFolder._id);
  newFolder.author = res.locals.currUser.username;
  await newFolder.save();
  await subject.save();
  res.redirect(`/subject/${subject._id}`);
});
router.get("/folder/enter/:id", isLogggedIn, async (req, res) => {
  try {
    let { id } = req.params;
    let folder = await Folder.findById(id).populate("subject");

    if (!folder) {
      req.flash("error", "Folder not found.");
      return res.redirect("back");
    }
    folder.image.reverse();

    res.render("./classroom/folder.ejs", { folder });
  } catch (e) {
    req.flash("error", "Failed to retrieve folder.");
    res.redirect(`/folder/enter/${id}`);
    console.log(e.message);
  }
});

router.get("/folder/back/:id", isLogggedIn, async (req, res) => {
  let { id } = req.params;
  let folder = await Folder.findById(id).populate("subject");
  let subject = await Subject.findById(folder.subject._id);
  res.redirect(`/subject/${subject._id}`);
});

router.delete("/folder/delete/:id", isLogggedIn, async (req, res) => {
  let { id } = req.params;
  let { name } = req.body;

  try {
    let folder = await Folder.findById(id).populate("subject");
    let subject = await Subject.findById(folder.subject);
    let newsubject = subject.folder.filter((folder) => !folder._id.equals(id));
    if (name !== folder.name) {
      req.flash("error", `Incorrect Name !`);
      return res.redirect(`/folder/enter/${folder._id}`);
    }
    subject.folder = newsubject;
    await subject.save();

    for (let i of folder.image) {
      cloudinary.uploader
        .destroy(i.originalName)
        .then((result) => console.log(result," Successfully Deleted From Cloudinary !"));
    }
    await Folder.deleteOne({ _id: id });
    req.flash("success", "Folder Deleted Successfully !");
    res.redirect(`/subject/${subject._id}`);
    console.log(`Folder ${name} deleted by ${res.locals.currUser.username}`)
  } catch (e) {
    console.log(e.message);
  }
});
router.get(
  "/folder/delete/nault_dev/:delId/:id",
  isLogggedIn,
  async (req, res) => {
    let { delId, id } = req.params;
    cloudinary.uploader
      .destroy(`nault_dev/${delId}`)
      .then((result) => console.log(result));
    try {
      let folder = await Folder.findById(id).populate("subject");
      let deleted = folder.image.filter((image) => image.originalName !== `nault_dev/${delId}`);
      folder.image = deleted;

      await folder.save();
      req.flash("success", "File Deleted Successfully!!");
      res.redirect(`/folder/enter/${id}`);
      console.log("One file is Deleted by ", res.locals.currUser.username, " of folder ", folder.name);
    } catch (err) {
      req.flash("error", "Failed to delete image.");
      res.redirect(`/folder/enter/${id}`);
    }
  }
);

module.exports = router;
