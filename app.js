require('./models/db')
const {quiz,question}=require('./models/quiz')

const express = require('express');
const path=require('path')
const exphb= require('express-handlebars')
const bodyParser=require('body-parser')
const cookieParser = require('cookie-parser');


const userController = require('./controllers/userController')


var app=express();
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser());
app.set('views',path.join(__dirname,'/views/'))
app.engine('hbs',exphb({
    extname:'hbs',
    defaultLayout:'mainLayout'
    ,
    layoutsDir:__dirname+'/views/layouts/'
}))
app.set('view engine','hbs')


app.listen(process.env.PORT||4000,()=>{
    console.log('Express server started at port 4000')
})

app.get('/',(req,res)=>{
    quiz.find({status:1}).populate({ path: 'owner', select: 'name' }).exec((err,quizzes)=>{
        if(err)
        res.render('home')
        else
        res.render('home',{quizzes:quizzes})
    })

})
app.get('/showquiz',(req,res)=>{
    quiz.findById(req.query.id,(err,quiz)=>{
        if(err)
        res.render('home')
        else
        res.render('showquiz',{
            quiz:quiz
        })
    })

})
app.use('/user',userController)