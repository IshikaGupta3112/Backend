const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true
},
otp:{
    type:String
}

},{timestamps:true})

const User = mongoose.model('user' , userSchema)

module.exports = User;