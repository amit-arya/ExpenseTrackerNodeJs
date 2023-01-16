const User = require('../models/user');
const Expense = require('../models/expense');

const getLeaderBoard = async (req, res)=>{
    try{
        const users = await User.findAll();
        const expenses = await Expense.findAll();
        const userExpenseGroup = {};
        expenses.forEach((expense) =>{
            if(userExpenseGroup[expense.userId]){
                userExpenseGroup[expense.userId] += expense.amount;
            } else{
                userExpenseGroup[expense.userId] = expense.amount;
            }
        })

        var userLeaderBoard = [];
        users.forEach((user)=>{
            userLeaderBoard.push({name: user.name, total_expense: userExpenseGroup[user.id] || 0})
        })

        userLeaderBoard.sort((a, b)=> b.total_expense - a.total_expense);
        res.status(200).json(userLeaderBoard);
    } catch(err){
        console.log(err);
        res.status(500).json(err);
    }
}

module.exports = { getLeaderBoard }