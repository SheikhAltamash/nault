if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const joi = require("joi");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const port = 8080;
const routerUser = require("./routes/user.js");
const flash = require("express-flash");
const User = require("./models/user.js");
const session = require("express-session");
const expressError = require("./utils/expressError.js");
const routerClassroom = require("./routes/classroom.js");
const routerSubject = require("./routes/subject.js");
const routerFolder = require("./routes/folder.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/nault");
}

main()
  .then((res) => {
    console.log("Connection Sucessfull !");
  })
  .catch((err) => {
    console.log(err);
  });

const sessionOptions = {
  secret:
    "MyNameIsAltamashAndIAmInCSEEngineeringInAnjumanCollegeOfEngineeringAndTechnology",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
    maxAge: 365 * 24 * 60 * 60 * 10000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions)); //This middleware is for session management

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

//Authenntication Middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flashing middlewares
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.listen(port, (req, res) => {
  console.log("listening on port " + port);
});
app.get("/", (req, res) => {
  res.send("All OK");
});
app.use("/login", routerUser);
app.use("/classroom", routerClassroom);
app.use("/subject", routerSubject);
app.use("/", routerFolder);

//Error Handling middleware
app.all("*", async (req, res, next) => {
  next(new expressError(404, (message = "Something went wrong!")));
});
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went Wrong !" } = err;
  res.sendStatus(message);
});

app.get("*", (req, res) => {
  res.send("Page Not Found !!");
});
