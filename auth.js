const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticate = (req, res, next) => {
    try{
        const token = req.header('Authorization');
        const user = jwt.verify(token, 'ih86754bvncbfuo876578yufvbnvcu87trd');
        console.log(user);
        User.findByPk(user.userId).then(user =>{
            req.user = user;
            next();
        })
        .catch(err => { throw new Error(err)})
    } catch(err) {
        return res.status(401).json({success: false})
    }
}

module.exports = {
    authenticate
}