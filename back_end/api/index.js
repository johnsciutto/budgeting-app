const express = require('express');
const userRouter = require('./routes/users');

const router = express.Router();

router.use('/user', userRouter);

const { registerUser, loginUser, editUser } = require('./controllers/users');
const { addTransaction, getTransactions } = require('./controllers/transaction');

module.exports = router;
