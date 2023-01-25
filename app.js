const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');

const sequelize = require('./util/database');
var cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:'a'});

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const expenseRoutes = require('./routes/expense-routes');
const userRoutes = require('./routes/user-routes');
const purchaseRoutes = require('./routes/purchase-routes');
const premiumRoutes = require('./routes/premium-routes');
const passwordRoutes = require('./routes/password-routes');

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const Forgotpassword = require('./models/forgotpassword');
const FileURL = require('./models/fileURL');

app.use(expenseRoutes);
app.use(userRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);

const dotenv = require('dotenv');
const { ConfigurationServicePlaceholders } = require('aws-sdk/lib/config_service_placeholders');
dotenv.config();

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(FileURL);
FileURL.belongsTo(User);

sequelize
    .sync()
    .then(result => {
        app.set('port', process.env.PORT || 8080);
       // console.log(`listening at port 8080`);
    })
    .catch(err => {
        console.log(err);
    })
