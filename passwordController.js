const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const Forgotpassword = require('../models/forgotpassword');
const User = require('../models/user');

const dotenv = require('dotenv');
const { reset } = require('nodemon');
dotenv.config();

exports.accountCreation = async (req, res) => {
    const { email } =  req.body;
    const user = await User.findOne({where : { email }});
    const id = uuid.v4();
    user.createForgotpassword({ id , active: true })
        .catch(err => {
            throw new Error(err)
        })
    
    sgMail.setApiKey(process.env.SENGRID_API_KEY)
    const msg = {
        to: req.body.email, // Change to your recipient
        from: 'dishwius@gmail.com', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
        .send(msg)
        .then((response) => {
            console.log('Email sent');
            return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', success: true})

        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({message: 'err', success: true})
        })
}

exports.resetPassword = async (req, res) =>{
    const id = req.params.id;
    Forgotpassword.findOne({ where : {id}}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ active: false});
            res.status(200).send(`<html>
                        <script>
                        function forsubmitted(e){
                            e.preventDefault();
                            console.log('called');
                        </script>
                        
                        <form action="/password/updatepassword/${id}" method="get">
                        <lable for="newpassword">Enter New password</lable>
                        <input name="newpassword" type="password" required></input>
                        <button>reset password</button>
                        </form>
                        
                        </html>`)

                        res.end()
        }
    })
}

exports.updatePassword = async (req, res) =>{
 try{
    const newPassword = req.query.newpassword;
    const resetPasswordId = req.params.resetpasswordId;
    
    await Forgotpassword.findOne({ where : { id : resetPasswordId }}).then(resetPasswordRequest =>{
        User.findOne({ where : {id : resetPasswordRequest.userId}}).then(user=>{
            if(user){
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, function(err, salt){
                    if(err){
                        console.log(err);
                        throw new Error(err);
                    }
                    bcrypt.hash(newPassword, salt, function(err, hash){
                        if(err){
                            console.log(err);
                            throw new Error(err);
                        }

                        user.update({password: hash}).then(()=>{
                            res.status(201).json({message: 'successfully updated the password'})
                        })
                    })
                })
            } else{
                return res.status(404).json({error:'No user exists', success:false})
            }
        })
    })
 } 
 catch(error){
    return res.status(403).json({error, success:false})
 } 
}