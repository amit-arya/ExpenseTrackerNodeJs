const path = require('path');

const express = require('express');

const purschaseController = require('../controllers/purchaseController');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/premiummembership', userAuthentication.authenticate, purschaseController.purchasePremium);

router.post('/updatetransactionstatus', userAuthentication.authenticate, purschaseController.updateTransaction);

module.exports = router;