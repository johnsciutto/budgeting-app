const express = require('express');
const transactionRouter = express.Router();
const {
  getTransaction,
  getTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
} = require('../controllers/transaction');

transactionRouter.get('/:transactionId', getTransaction);
transactionRouter.get('/:userId', getTransactions);
transactionRouter.post('/:userId', addTransaction);
transactionRouter.put('/:transactionId', editTransaction);
transactionRouter.delete('/:transactionId', deleteTransaction);

module.exports = { transactionRouter };
