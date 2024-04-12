const express = require("express");
const app = express();
const mongoose = require("mongoose");
const joi = require("joi");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const port = 8088;
const router = express.Router();
const User = require("../models/user.js");
const wrapasync  = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get('/', (req, res) => {
  res.render("./authenticate/login.ejs")
});

router.get("/signup/forget", (req, res) => {
  res.render("./authenticate/forgot.ejs")
});


router.post("/log",saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), (req, res) => {
 req.flash("success", "Welcome to Nault !!!");
 let RedirectURL = res.locals.redirectUrl || "/classroom";
 res.redirect(RedirectURL);
  console.log("All ok !!!");

});

 router.get("/signup", (req, res) => {
   res.render("./authenticate/signup.ejs");
 });


router.post("/signup",async (req, res, next) => {
  let { username, email, password } = req.body;
  const find = await User.findOne({ email: email });
  if (find) {
    req.flash('error', 'The email address is already registered');
    res.redirect("/login/signup");
  }
    else {

     try {
  
      const newUser = new User({ username, email });
       const registerUser = await User.register(newUser, password);
       req.login(registerUser, (err) => {
         if (err) {
           return next(err);
         }
        
         res.redirect("/classroom");
       })

      console.log(username, email);
    }
    catch (err) {
      req.flash('error', err.message);
      res.redirect("/login/signup");
      };
  }
});


router.get("/logout", (req, res) => { 
  
})


module.exports = router;