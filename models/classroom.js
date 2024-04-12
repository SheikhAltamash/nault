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
const Subject = require("../models/subject.js");


const ClasssroomSchema = new Schema({
    
    student: [{
        type: Schema.Types.ObjectId,
        ref:"User",
    }],
    subject: [
        {
            type: Schema.Types.ObjectId,
            ref:"Subject",
        }     
    ],
});
ClasssroomSchema.plugin(passportLocalMongoose);
const Classroom = mongoose.model("classrooms", ClasssroomSchema);
module.exports = Classroom;

