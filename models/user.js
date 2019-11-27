const mongoose = require("mongoose");

let Schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        match: [/^([A-Za-z0-9_\-.])+@([gmail|yahoo])+\.([A-Za-z]{2,4})$/, "Please fill a valid email address"],
        trim: true
    },
    github: {
        type: String,
        trim: true
    },
    password:{
        type:String,
        trim:true
    },
    admin:{
        type:String
    },
    mentorEngineer:{
        type:String
    },
    ideationEngineer:{
        type:String
    },
    ideationLead:{
        type:String
    }
},
    { timestamps: true },
    { strict: true }
)

let users = mongoose.model("Users",Schema,"Users");
module.exports = users