const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapAsync.js");
const classroom = require("../models/classroom.js");
const passport = require("passport");
const { isLogggedIn, saveRedirectUrl } = require("../middleware.js");
router.get("/", isLogggedIn ,function (req, res) {
  res.render("./classroom/create.ejs");
});

router.get("/create", isLogggedIn,(req, res) => {
  res.render("./classroom/class_create.ejs");
});

router.post(
  "/create", isLogggedIn,
  wrapasync(async (req, res, next) => {
    let { username, password } = req.body;
    try {
      let classroomData = await new classroom({ username });
      let registeredClassroom = await classroom.register(
        classroomData,
        password
      );
      console.log("Classroom Created");
      let sub = classroomData;

      res.render("./classroom/home.ejs", { classData: sub });
    } catch (err) {
      req.flash("error", "The classroom name has already been registered !!!");
      res.redirect("/classroom/create/");
    }
    console.log(username, password);
  })
);

router.post(
  "/enter",
  isLogggedIn,
  passport.authenticate("local", {
    failureRedirect: "/classroom",
    failureFlash: true,
  }),
  wrapasync(async (req, res) => {
    let { username, password } = req.body;
    let classData = await classroom
      .findOne({ username: username })
      .populate("subject");
    if (!password) {
      req.flash("error", "Enter password !!!");
      res.redirect("/classroom");
    } else if (!classData) {
      req.flash("error", "Classroom not found");
      res.redirect("/classroom");
    } else {
      //Including User id in the classroom
      // const userIntClass = classData.student.includes(req.user._id);
      // if (userIntClass) {
      //     classData.student.push(req.user._id);
      //     await classData.save();
      // }
      res.locals.classData = classData;
      req.session.home = classData;
      res.render("./classroom/home.ejs");
    }
  })
);

router.get("/enter", isLogggedIn,(req, res) => {
  let classData = req.session.classData;
  res.locals.classData = classData;

  res.render("./classroom/home.ejs");
});

router.get("/enter/subject", (req, res) => {
  req.session.classData = req.session.home;

  res.redirect("/classroom/enter");
});
module.exports = router
