const express = require('express');
var helper =require('../helper')
var router =express.Router();
const mongoose = require('mongoose');
const jwt=require('jsonwebtoken')
var bcrypt = require('bcryptjs');
const auth = require('../middleware/auth')
require('dotenv').config()
const {user,validate}=require('../models/user')
const {quiz,question}=require('../models/quiz')

router.get('/signup',(req,res)=>{
    
    res.render('user/signup')
})
router.get('/emailsend',(req,res)=>{
    
    res.render('user/emailsend')
})
router.get('/signin',(req,res)=>{
    res.render('user/signin')
})
router.get('/signout',auth,(req,res)=>{
    res.clearCookie('quizUserToken')
    res.redirect('/')
})
router.get('/showquiz',auth,(req,res)=>{
    quiz.findById(req.query.id,(err,quiz)=>{
        if(err)
        res.render('user/wellcome')
        else
        res.render('user/showquiz',{
            quiz:quiz
        })
    })
})
router.get('/wellcome',auth,(req,res)=>{
    quiz.find({owner:mongoose.Types.ObjectId(req.user_id)},(err,quizzes)=>{
        if(err)
        res.render('user/wellcome')
        else
        res.render('user/wellcome',{
            quizzes:quizzes
        })

    })

})
router.get('/createquiz',(req,res)=>{
    res.render('user/createquiz')
})
router.post('/createquiz',auth,(req,res)=>{
    let new_quiz=new quiz()
    new_quiz.name=req.body.name
    new_quiz.owner=mongoose.Types.ObjectId(req.user_id)
    new_quiz.save((err,quiz)=>{
        if(err)
        {res.render('user/wellcome')}
        else
        {res.render('user/createquiz',{
            quiz:{
                name:quiz.name,
                id:quiz._id
            }
        })}
    })
    
})
router.post('/addquestion',auth,(req,res)=>{
    let new_question=new question()
   new_question.title=req.body.title
   new_question.correct=req.body.correct
   new_question.answers[0]=req.body.a1
   new_question.answers[1]=req.body.a2
   new_question.answers[2]=req.body.a3
   new_question.explanation=req.body.explanation
    quiz.findByIdAndUpdate(req.body.id,{ $push: { questions: new_question }},(err,quiz)=>{
        if(err)
        {res.render('user/createquiz')}
        else
        {res.render('user/createquiz',{
            quiz:{
                name:quiz.name,
                id:quiz._id
            }
        })}
    })
    
})
router.post('/signup',async (req,res)=>{
    const {error}=validate(req.body)
    if(error) 
   {
       req.body.Error=error.details[0].message
        return res.render('user/signup',{
        user: req.body
    })}
    let new_user=new user()
    new_user.name=req.body.name
    new_user.email=req.body.email
    let cipher_pass=await helper.encrypt(req.body.password)
    new_user.password=cipher_pass
    new_user.save((err,user)=>{
        if(err){
            if(err.code==11000)
            req.body.Error="This Email Is Taken"
            else
            req.body.Error="ERROR IN SERVER You May try our App later"
        res.render('user/signup',{
            user: req.body
        })}
        else
        {
            let token=jwt.sign({id:user._id}, process.env.user_private_key,{ expiresIn: '2h' })
            helper.send_mail("http://quiz3dx-env.vtekns9fvr.us-east-1.elasticbeanstalk.com/user/verifyemail/"+token,req.body.email)
            res.redirect('emailsend')
        }
    }) 
})
router.post('/signin',(req,res)=>{
    
    user.findOne({'email':req.body.email},async (err, user)=>{
        if (err || user==null) {
             req.body.Error="Wrong Email"
             return  res.render('user/signin',{
                user: req.body
            })
        }
        else if(user.status!=1)
        {
            req.body.Error="Your Email is not verified yet"
            return  res.render('user/signin',{
                user: req.body
            })
        }
        else {
             const valid = await bcrypt.compare(req.body.password,user.password); 
              if(!valid) {
                req.body.Error="Wrong Password"
                return  res.render('user/signin',{
                   user: req.body
               })
              }
              let token=jwt.sign({id:user._id}, process.env.user_private_key)
              res.cookie('quizUserToken', token);
              res.redirect('wellcome')
                
        }
    })
    
})
router.get('/verifyemail/:token',(req,res)=>{
    const {id} = jwt.verify(req.params.token,process.env.user_private_key)
    user.findByIdAndUpdate(id,{status:1},(err,user)=>{
        if(err)
        res.redirect('/user/signup')
        else
        res.redirect('/user/emailverified')
    })
    
})
router.get('/emailverified',(req,res)=>{
    res.render('user/emailverified')
})
router.post('/forgetpassword',(req,res)=>{
    user.findOne({email:req.body.email},(err,user)=>{
        if(err)
        res.redirect('/user/signin')
        else
        {
            let token=jwt.sign({id:user._id}, process.env.user_private_key,{ expiresIn: '2h' })
            helper.send_mail("http://quiz3dx-env.vtekns9fvr.us-east-1.elasticbeanstalk.com/user/changepassword?id="+token,req.body.email)
            res.redirect('emailsend')
        }
    })
})
router.get('/changepassword',(req,res)=>{
    res.render('user/changepassword',{id:req.query.id})
})
router.post('/changepassword',async(req,res)=>{
    let token=req.body.token
    const {id} = jwt.verify(token,process.env.user_private_key)
    let cipher_pass=await helper.encrypt(req.body.password)
    user.findByIdAndUpdate(id,{password:cipher_pass},(err,user)=>{
        if(err)
       {
            res.redirect('/user/signin')}
        else
        res.redirect('/user/signin')
    })

})
router.get('/deletequestion',auth,(req,res)=>{
    quiz.findOneAndUpdate({owner:mongoose.Types.ObjectId(req.user_id),_id:req.query.qid},{ $pull:{ questions:{_id:req.query.id}}},(err,quiz)=>{
        if(err)
        {
            res.redirect('showquiz?id='+req.query.qid)
        }
        else{
            res.redirect('showquiz?id='+req.query.qid)
        }
    })
})
router.get('/editquestion',auth,(req,res)=>{
    quiz.findOne({owner:mongoose.Types.ObjectId(req.user_id),_id:req.query.qid},(err,quiz)=>{
        if(err)
        {
            res.redirect('showquiz?id='+req.query.qid)
        }
        else{
            var question = quiz.questions.filter(obj => {
                if(req.query.id==obj._id)
               { quiz.title=obj.title
              quiz.explanation=obj.explanation
              quiz.correct=obj.correct
              quiz.a1=obj.answers[0]
              quiz.a2=obj.answers[1]
              quiz.a3=obj.answers[2]
              quiz.qid=obj._id}
              })
            res.render('user/editquestion',{
                quiz:quiz,
            })
        }

    })

})
router.post('/editquestion',auth,(req,res)=>{
    let answers=[req.body.a1,req.body.a2,req.body.a3]
    quiz.findOneAndUpdate({owner:mongoose.Types.ObjectId(req.user_id),_id:req.body.id,questions: { $elemMatch:{_id:req.body.qid}}},
    {name:req.body.name ,  $set: { "questions.$.title" : req.body.title,
    "questions.$.explanation" : req.body.explanation,
    "questions.$.answers":answers,
    "questions.$.correct":req.body.correct,
 } },(err,quiz)=>{
        if(err)
        {
            res.redirect('showquiz?id='+req.query.qid)
        }
        else{
            
            res.redirect('showquiz?id='+quiz._id)
        }
    })
})
router.get('/addquestion',auth,(req,res)=>{
    res.render('user/createquiz',{
        quiz:{
            id:req.query.id
        }
    })
})
router.post('/publishquiz',auth,(req,res)=>{
    quiz.findByIdAndUpdate(req.body.id,{status:1},(err,quiz)=>{
        if(err)
        res.render('user/wellcome')
        else
        res.redirect('showquiz?id='+req.body.id)
    })
})

module.exports=router