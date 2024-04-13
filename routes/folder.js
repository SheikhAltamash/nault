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

router.get("/", function (req, res) {
  res.render("./classroom/folder.ejs");
});

router.post("/upload/:id",isLogggedIn, upload.single("image"),async (req, res) => {
  try {
    let url = req.file.path;
    let { name } = req.body;
    let filename;
    if (name) {
      filename = name;
    }
    else {
      filename = req.file.originalname;
    }
     

    let { id } = req.params
    let author = res.locals.currUser.username;
    let folder = await Folder.findById(id);
    console.log(req.file);
    console.log(author);
    folder.image.push({ url,filename,author});
    await folder.save();
    req.flash("success","File Uploaded Successfully !!!")
    res.redirect(`/folder/enter/${folder._id}`);
  } catch (e) {
    console.log(e.message);
  }
});

router.post("/subject/folder/:id", async (req, res) => {
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
router.get("/folder/enter/:id", isLogggedIn,async (req, res) => {
  let { id } = req.params;
  let folder = await Folder.findById(id);
  res.render("./classroom/folder.ejs", { folder });
});
router.delete("folder/enter/folder/delete/:id", async (req, res) => {
  // let { id } = req.params;
  // let folder = await Folder.findById(id);
  // let subject = await Subject.findById(folder.subject);
  // console.log(folder.subject._id);
  // // res.redirect(`/subject/${subject.id}`);
  res.send("hello");
});
router.get("/file/:url/:id",(req,res)=> {
  let { url,id } = req.params;
  let arrayUrl = url.split("/");
  let urlArray = arrayUrl[arrayUrl.length - 1];
  let imageName = urlArray.split(".")[0];
  console.log(imageName);
  res.send("Hello")
})

module.exports = router;
