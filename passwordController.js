const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const Forgotpassword = require('../models/forgotpassword');
const User = require('../models/user');

exports.accountCreation = async (req, res) => {
    const { email } =  req.body;
    console.log(req.body.email);
    const user = await User.findOne({where : { email }});
    const id = uuid.v4();
    user.createForgotpassword({ id , active: true })
        .catch(err => {
            throw new Error(err)
        })

    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to: req.body.email, // Change to your recipient
        from: 'dishwius@gmail.com', // Change to your verified sender
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
        .send(msg)
        .then((res) => {
            console.log('Email sent');
            return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', success: true})

        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({message: 'err', success: true})
        })
}