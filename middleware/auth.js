const jwt = require('jsonwebtoken')
require('dotenv').config();

function auth (req, res, next){
const token = req.cookies['quizUserToken'];
if(!token) return  res.render('user/wellcome')
try{
const {id} = jwt.verify(token,process.env.user_private_key)
req.user_id=id;
next();
}
catch (ex){
    res.render('user/wellcome')

}

}
module.exports = auth