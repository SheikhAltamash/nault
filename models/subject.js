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
const Schema = mongoose.Schema;
const User = require("../models/user.js");
const Folders = require("../models/folder.js");

const SubjectSchema = new Schema({
  username: String,
  classroom: { type: Schema.Types.ObjectId },
  folder: [
    {
      type: Schema.Types.ObjectId,
      ref: "Folders",
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
  },
});
SubjectSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Subject", SubjectSchema);
