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
const Classroom = require("./classroom");

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  classroom:{
    type: Schema.Types.ObjectId,
    ref: Classroom
  }
  
});
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Users", UserSchema);

