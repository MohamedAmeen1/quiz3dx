var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
saltRounds=10;
require('dotenv').config();
var nodemailer = require("nodemailer");


module.exports = {
    encrypt: async function (plain_text){
        let h=0;
        await bcrypt
        .genSalt(saltRounds)
        .then(salt => {
          return bcrypt.hash(plain_text, salt);
        })
        .then(hash => {
            h=hash
            return
        })
        .catch(err => console.error(err.message));
        return h
    },
    send_mail:function (url,email){
      var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
              user: process.env.send_email,
              pass: process.env.send_password
          }
      });
      console.log("email :",email)
      // setup e-mail data with unicode symbols
      var mailOptions = {
          from: "Quizapp3Dx<mohamedquizdx@gmail.com>", // sender address
          to: email, // list of receivers
          subject: "verifiy message", // Subject line
          // text: message, // plaintext bodys
          html: `          <div  style="width:1000px;height:200px;background-image: url('https://yamp.s3.amazonaws.com/k.jpg');background-color:#fff; border-radius: 5px;margin: 10px;margin-top: 5px;text-align:center;">
          <div style="background-color: rgba(0,0,0,0.5); border-radius: 20px;margin:auto;width:95%;height:95%;"><br>
              <p  style="font-size:20px; color: #fff;font-family: tahoma">Verify your email address</p>
              <p  style="font-size:14px; color: #fff;font-family: tahoma">In order to start using your quiz app account, you need to confirm your email address.
              </p><br>
          <button  style="background-color:#007AFF ;padding: 15px 20px;border: none;    color: #fff;    border-radius: 10px;"><a href="${url}" style="  color: #fff;
              text-decoration: none;">Verify Email</a></button>        ​
          </div>
          </div>` // html body
      } 
      // send mail with defined transport object
      smtpTransport.sendMail(mailOptions, function(error, response){
          if(error){
              console.log(error);
          }else{
              console.log("Message sent: " + response);
          }
      
          // if you don't want to use this transport object anymore, uncomment following line
          //smtpTransport.close(); // shut down the connection pool, no more messages
      });
   }
  };