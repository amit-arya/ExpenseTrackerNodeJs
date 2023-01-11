const path = require('path');
const User = require('./models/user');
const Expense = require('./models/expense');

const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./util/database');
var cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/user/signup', async (req, res) => {
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
})

app.post('/get-user', async (req, res) => {
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
                    res.status(200).json({ success: true, message: "User logged in successfully" })
                   // res.redirect('http://127.0.0.1:5500/expense/expense.html');
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
})

app.post('/add-expense', async (req, res) => {
    try {
        const amount = req.body.amount;
        const desc = req.body.desc;
        const category = req.body.category;

        const expense = await Expense.create({ amount: amount, desc: desc, category: category });
        res.status(201).json({ newExpense: expense });
    }
    catch (err) {
        res.status(500).json({ error: err });
    }
})

app.get('/get-expenses', async (req, res) => {
    try {
        const expenses = await Expense.findAll();
        res.status(201).json({ expenses });
    } catch (err) {
        res.status(500).json({ error: err });
    }
})

app.delete('/delete-expense/:id', async (req, res)=>{
    try{
        const expenseId = req.params.id;
        await Expense.destroy({where : {id:expenseId}});
        res.sendStatus(201);
    } catch(err) {
        res.status(500).json({ error: err });
    }
})

sequelize
    .sync()
    .then(result => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err);
    })
