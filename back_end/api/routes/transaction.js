const express = require('express');
const { protectRoute } = require('../middleware/auth');
const {
  getTransaction,
  getTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
} = require('../controllers/transaction');

const transactionRouter = express.Router();

transactionRouter.use(protectRoute);

transactionRouter.get('/:transactionId', getTransaction);
transactionRouter.get('/', getTransactions);
transactionRouter.post('/', addTransaction);
transactionRouter.put('/:transactionId', editTransaction);
transactionRouter.delete('/:transactionId', deleteTransaction);

module.exports = { transactionRouter };
