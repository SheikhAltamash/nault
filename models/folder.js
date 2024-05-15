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
const User = require("../models/user.js");

const { Schema } = mongoose;
const folderSchema = new Schema({
  name: String,
  subject: {
    type: Schema.Types.ObjectId,
    ref:"Subject",
  },
  image: [{
    url: String,
    filename: String,
    author: String,
    originalName:String,
  }],
  author:String,

});
const Folder = mongoose.model("Folders", folderSchema);
module.exports = Folder;