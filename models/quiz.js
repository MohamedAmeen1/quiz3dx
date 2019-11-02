const mongoose = require("mongoose");
const Joi =require('joi')
const questionSchema= new mongoose.Schema({
    title:{
        type:String
    },
    answers:[
        String
    ],
    correct:{
        type:Number,
        default:1
    },
    explanation:{
        type:String
    }
})
const quizSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true,
        required: 'name is required'
    },
    status:{
        type:Number,
        default:0
    },
    questions:[
        questionSchema
    ],
    owner:{
        type:mongoose.SchemaTypes.ObjectId ,ref:'user'
    }
})
module.exports.quiz =mongoose.model("quiz", quizSchema)
module.exports.question =mongoose.model("question", questionSchema)
