const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signupUser = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            const user = await User.create({ name: name, email: email, password: hash });
            res.status(201).json({ newUser: user });
        })
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

function generateAccessToken(id, name) {
    return jwt.sign({userId:id, name:name}, 'ih86754bvncbfuo876578yufvbnvcu87trd');
}

exports.loginUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const users = await User.findAll({ where: { email } });
        if (users.length > 0) {
            bcrypt.compare(password, users[0].password, (err, result) => {
                if (err) {
                    throw new Error('something went wrong');
                }
                if (result === true) {
                    res.status(200).json({ success: true, message: "User logged in successfully",
                     token: generateAccessToken(users[0].id, users[0].name), user: users[0] })
                }
                else {
                    res.status(400).json({ success: false, message: "Incorrect password" })
                }
            })
        }
        else {
            res.status(404).json({ success: false, message: "User doesn't exist" })
        }
    } catch (err) {
        res.status(500).json({ error: err });
    }
}