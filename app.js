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
const port = 8081;
const routerUser = require("./routes/user.js");
const flash = require("express-flash");
const User = require("./models/user.js");
const session = require("express-session");
const expressError = require("./utils/expressError.js");
const routerClassroom = require("./routes/classroom.js");
const routerSubject = require("./routes/subject.js");
const routerFolder = require("./routes/folder.js");
const mongoUrl = process.env.MONGO_URL;
const mongoStore = require("connect-mongo");
const cors = require("cors");
const axios = require("axios")
const { send } = require("vite");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(cors());
app.use(express.json());
async function sendReq() {
  let data = await axios.get(
    "https://social-insights-backend.onrender.com/alive"
  );
  console.log(data.data);
}
setInterval(()=>{sendReq()},20000)

app.listen(port, (req, res) => {
  console.log("listening on port " + port);
});

if (!mongoUrl) {
  console.error("MongoDB connection URL is not provided.");
  process.exit(1);
}

const store = mongoStore.create({
  mongoUrl: mongoUrl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (e) => {
  console.log("Error: " + e);
});

const sessionOption = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 190 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
async function main() {
   mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 3000
  }); 
}
// async function main(){
//   await mongoose.connect("mongodb://localhost:27017/nault");
// };
main()
  .then((res) => {
    console.log("Connection Sucessfull !");
  })
  .catch((err) => {
    console.log(err);
  });
app.get("/", (req, res, next) => {
  res.redirect("/classroom/enter");
});

app.use(flash());
app.use(session(sessionOption)); 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.deleteID;
  res.locals.showform = false;
  next();
});
app.use("/login", routerUser);
app.use("/classroom", routerClassroom);
app.use("/subject", routerSubject);
app.use("/", routerFolder);

app.all("*", async (req, res, next) => {
  next(new expressError(404, (message = "Something went wrong!")));
});
app.use((e, req, res, next) => {
  res.sendStatus(e.message);
});
app.get("*", (req, res) => {
  res.send("Page Not Found !!");
});
