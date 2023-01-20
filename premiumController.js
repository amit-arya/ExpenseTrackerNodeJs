const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../util/database');

const Userservices = require('../services/userservices');
const S3services = require('../services/s3services');

const getLeaderBoard = async (req, res)=>{
    try{
        const leaderboardofusers = await User.findAll({
            attributes:['id', 'name', [sequelize.fn('sum', sequelize.col('expenses.amount')), 'total_expense']],
            include:[
                {
                    model: Expense,
                    attributes: []
                }
            ],
            group:['user.id'],
            order:[['total_expense', 'DESC']]
        })

        res.status(200).json(leaderboardofusers);
    } catch(err){
        console.log(err);
        res.status(500).json(err);
    }
}

const downloadExpense = async (req, res)=>{
    try{
        const expenses = await Userservices.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);
    
        const userId = req.user.id;
        const filename = `expense${userId}/${new Date()}.txt`;
        const fileURL = await S3services.uploadToS3(stringifiedExpenses, filename);
        res.status(200).json({fileURL, success:true});
    } catch(err){
        console.log(err);
        res.status(500).json({fileURL:'', success:false, Error:err})
    }
}

module.exports = { getLeaderBoard, downloadExpense }