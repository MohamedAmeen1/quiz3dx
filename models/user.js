const mongoose = require("mongoose");
const Joi =require('joi')
var validate = function(data) {
    let schema ={
        name:Joi.string().min(3).max(20),
        email:Joi.string().email(),
        password:Joi.string()
    }
    return Joi.validate(data,schema)
};

const userSchema =new mongoose.Schema({
    name: {
        type: String,
        required: true,
        required: 'name is required'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        required: 'Email address is required',
    },
    password: {
        type: String,
        required: true ,
        required: 'password is required'   
    },
    status:{
        type:Number,
        default:0
    }
  
})
module.exports.user =mongoose.model("user", userSchema)
module.exports.validate =validate