const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.MongoDBO,{useNewUrlParser:true,useFindAndModify:false,useUnifiedTopology: true},(err)=>{
    if(!err) {
        console.log('MongoDB connection succeeded.')
    }
    else{
        console.log('error in DB connection :'+err)
    }
});
// require('./employee.model')