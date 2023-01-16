const User = require('../models/user');
const Expense = require('../models/expense');
const sequelize = require('../util/database');

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

module.exports = { getLeaderBoard }