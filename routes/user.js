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
const wrapasync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const {
  otpSender,
  generateOTP,
  resetOtpsender,
} = require("../public/js/mail.js");
const crypto = require("crypto");

router.get("/", (req, res) => {
  res.render("./authenticate/login.ejs");
});
router.get("/signup", (req, res) => {
  res.render("./authenticate/signup.ejs");
});
router.get("/verify-otp", (req, res) => {
  res.render("./authenticate/verifyOtp.ejs");
});
router.get("/forgotpassword", (req, res) => {
  res.render("./authenticate/forgot.ejs")
});
router.get("/verifyOtpforgot", (req, res) => {
  res.render("./authenticate/verifyOtpforgot.ejs")
})
router.post("/nault", (req, res) => {
  let { data } = req.body;
  console.log(data)
  console.log("come to server");
})
router.post(
  "/log",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    let { username } = req.body;
    req.flash("success", "Welcome to Nault !!!");
    let RedirectURL = res.locals.redirectUrl || "/classroom";
    res.redirect(RedirectURL);
    console.log(`${username} Logged In`);
  }
);


router.post("/signup", async (req, res, next) => {
  let { username, email, password } = req.body;
  const find = await User.findOne({ email: email });
  const name = await User.findOne({ username: username });
 
  if (name) {
    req.flash("error", "The Username is already registered");
    res.redirect("/login/signup");
  }
   else if (find) {
    req.flash("error", "The email address is already registered");
    res.redirect("/login/signup");
  }
  
  else {

    try {
        const otp = generateOTP();
      req.session.otpm = otp; // Store OTP in session
      req.session.email = email; // Store email in session for verification
      req.session.password = password
      req.session.username=username
      await otpSender(username, email, otp);
      req.flash("success", "OTP has been send to your email")
     res.render("./authenticate/verifyOtp.ejs" ,{email});
      console.log(username, "signup to nault");
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/login/signup");
    }
  }
});

router.post("/verify-otp",async (req, res) => {
  try {
    let { otp } = req.body;
    let { otpm, email, username, password } = req.session;
    if (!otp || !email) {
      req.flash("error", "Invalid OTP or session expired.");
      return res.redirect("/login/verify-otp");
    }
    if (otp === otpm) {
      // OTP is valid, proceed with user activation
      // Optionally clear OTP from session

      const newUser = new User({ username, email });
      const registerUser = await User.register(newUser, password);
       req.login(registerUser, (err) => {
        if (err) {
         
              delete req.session.otp;
              delete req.session.otpEmail;
              delete req.session.username;
          delete req.session.password;
           req.flash("error", err.message);
          return next(err);
         }
            delete req.session.otp;
            delete req.session.otpEmail;
            delete req.session.username;
            delete req.session.password;
      req.flash("success", "OTP verified successfully!");
       return res.redirect("/classroom");
     });
    
   
    } else {
      req.flash("error", "Invalid OTP. Please try again.");
      return res.redirect("/login/verify-otp")
    }
    } catch (e) {
    console.log(e);
    return res.redirect("/login/signup");
}
})

router.get("/logout", (req, res) => {
  if (req.isAuthenticated()) {
    req.logOut((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You have been logged out !");
      res.redirect("/login");
    });
  } else {
    res.redirect("/classroom");
  }
});
router.post("/forgot", async (req, res) => {
  const email = req.body.email;
  let data = await User.findOne({ email });
  if (!data) {
    req.flash("error", "Email not found !");
  return res.redirect("/login/forgotpassword");
  }
  else {
    try {
      const otp = generateOTP();
      req.session.otpm = otp;
      req.session.email = email; // Store email in session for verification
      req.session.username = data.username;
       await resetOtpsender(data.username, email, otp);
      req.flash("success", "OTP has been send to your email");
      res.render("./authenticate/verifyOtpforgot.ejs",{email});
    } catch (e){
      console.log(e.message);
      req.flash("error", "Something went wrong !");
      res.redirect("/login");
    }

  }
});
router.post("/verify-otp/forgot", async (req, res) => {
  try {
    let { otp } = req.body;
    let { otpm} = req.session;
    if (!otpm || !otp) {
      req.flash("error", "Invalid OTP or session expired.");
      return res.redirect("/login/forgotpassword");
    }
    if (otp === otpm) { 
             delete req.session.otpm;         
      req.flash("success","OTP Verified !")
      return res.render("./authenticate/resetPassword.ejs");

    }  
    else {
      req.flash("error", "Invalid OTP .");
      res.redirect("/login/verifyOtpforgot");
    }
         
  } catch (e) {
    console.log(e);
           delete req.session.otpm;
           delete req.session.email;
           delete req.session.username;
      
    req.flash("error","Something went Wrong")
    return res.redirect("/login/login");
  }
});
router.post("/resetPassword", async (req, res) => {
  try {
    let { newPassword1,newPassword2 } = req.body;
    let { email } = req.session;

    if (!newPassword1 || !newPassword2 || !email) {
          delete req.session.otpm;
          delete req.session.email;
          delete req.session.username;
      
      req.flash("error", "Invalid password or session expired.");
      return res.redirect("/login/forgotpassword");
    }
    if (newPassword1 !== newPassword2) {
      req.flash("error", "Password does not match !");
      return res.render("./authenticate/resetPassword.ejs");
     }
    let user = await User.findOne({ email});
    if (!user) {
          
          delete req.session.email;
          delete req.session.username;
      
      req.flash("error", "User not found!");
      return res.redirect("/login/forgotpassword");
    }
      delete req.session.email;
      delete req.session.username;
    await user.setPassword(newPassword1);
    await user.save();

    req.flash("success", "Password updated successfully");
    res.redirect("/login"); // Redirect to login after password reset
  } catch (error) {
    console.error(error);
    req.flash("error", "An error occurred while updating the password.");
    res.redirect("/login/forgotpassword");
  }
});


module.exports = router;
