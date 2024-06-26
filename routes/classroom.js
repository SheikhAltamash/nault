const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapAsync.js");
const passport = require("passport");
const Subject = require("../models/subject.js");
const { isLogggedIn, saveRedirectUrl } = require("../middleware.js");
const Classroom = require("../models/classroom.js");
const Folder = require("../models/folder.js");
router.get("/", isLogggedIn, function (req, res) {
  res.render("./classroom/enterClassroom.ejs");
});


router.get("/create", isLogggedIn, (req, res) => {
  res.render("./classroom/createClassroom.ejs");
});

router.post(
  "/create",
  isLogggedIn,
  wrapasync(async (req, res, next) => {
    let { username, password } = req.body;
    try {
      let classroomData = await new Classroom({ username });
      let registeredClassroom = await Classroom.register(
        classroomData,
        password
      );
      console.log("Classroom Created : ",username," by  ",res.locals.currUser.username);
      let sub = classroomData;
      res.render("./classroom/home.ejs", { classData: sub });
    } catch (err) {
      req.flash("error", "The classroom name has already registered !!!");
      res.redirect("/classroom/create/");
    }
  })
);

router.post(
  "/enter",
  isLogggedIn,
  wrapasync(async (req, res) => {
    let { username, password } = req.body;
    let classData = await Classroom
      .findOne({ username: username })
      .populate("subject")
      .populate("student");
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

      if (
        !classData.student.some(
          (student) => student._id.toString() === req.user._id.toString()
        )
      ) {
        classData.student.push(res.locals.currUser);
        await classData.save();
        console.log( res.locals.currUser.username," name added in classroom" , classData.username);
      }

      // for (let data of classData.student) {
      //   console.log(data);
      // }
      res.locals.classData = classData;
      req.session.classData = classData;
      res.render("./classroom/home.ejs");
    }
  })
);

router.get("/enter", isLogggedIn, (req, res) => {
  let classData = req.session.classData;
  res.locals.classData = classData;

  res.render("./classroom/home.ejs");
});
 
async function findClassroomAndRender(id,res) {
    let classData = await Classroom.findById(id.classroom._id).populate(
      "subject"
    );
  res.locals.classData = classData;
  res.render("./classroom/home.ejs");

}
router.get("/enter/:id",isLogggedIn, async(req, res) => {
  let { id } = req.params;
  let subject = await Subject.findById(id).populate("classroom");
  findClassroomAndRender(subject,res);


});
router.get("/enter/folder/:id",async (req, res) => {
  let { id } = req.params;
  let folder = await Folder.findById(id).populate("subject");
  findClassroomAndRender(folder.subject, res); 

})
module.exports = router;
