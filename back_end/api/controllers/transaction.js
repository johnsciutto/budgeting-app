const { Transaction, User, Category } = require('../models/index');
const { Validation } = require('../../config/utils/validation');
const { DataPreparation } = require('../../config/utils/dataPreparation');

const addTransaction = async (req, res) => {
  const response = { ok: true, error: null, transactionId: null };
  try {
    const { name, amount, date, note, type, category } = req.body;
    const { userId } = req.params;

    const isValid = Validation.isValidTransaction({ name, amount, date, note });
    if (!isValid.ok) {
      throw new Error(isValid.error);
    }

    const dbCategory = await Category.findOne({
      where: { type, name: category },
    });

    if (!dbCategory) {
      throw new Error(
        `The "${type}" category of "${category}" was not found in the database.`
      );
    }

    const { id } = await Transaction.create({
      userId,
      name,
      amount,
      date,
      note,
      categoryId: dbCategory.id,
    });

    response.ok = true;
    response.transactionId = id;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const editTransaction = async (req, res) => {
  const response = { ok: true, error: null, transactionId: null };
  try {
    const transactionId = 0;
    // TODO: Write function...
    Transaction.update({}, { where: { id: transactionId } });
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const deleteTransaction = async (req, res) => {
  const response = { ok: true, error: null, transactionId: null };
  try {
    // TODO: Write function...
    const transactionId = 0;
    Transaction.destroy({ where: { id: transactionId } });
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const getTransaction = async (req, res) => {
  const response = { ok: true, error: null, transaction: null };
  try {
    const transactionId = parseInt(req.params.transactionId);

    if (isNaN(transactionId)) {
      throw new Error(
        `The given transaction id is invalid: ${req.params.transactionId}`
      );
    }

    if (!transactionId) {
      throw new Error(`The given transaction id is invalid: ${transactionId}`);
    }

    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      throw new Error(`The transaction with the given id (${transactionId}) was not found.`)
    }

    response.transaction = transaction;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const getTransactions = async (req, res) => {
  const response = { ok: true, error: null, transactions: null };
  try {
    const rawData = req.params;
    const filter = DataPreparation.createTransactionFilter(rawData);

    if (!filter.ok) {
      throw new Error(filter.error);
    }

    const result = await Transaction.findAllFiltered(filter.data);
    response.transactions = result.transactions;
    response.transactionCount = result.transactionCount;

    response.ok = true;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

module.exports = {
  getTransaction,
  getTransactions,
  addTransaction,
  editTransaction,
  deleteTransaction,
};
