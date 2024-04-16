const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;



const ClasssroomSchema = new Schema({
    
    student: [{
        type: Schema.Types.ObjectId,
        ref:"Users",
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

