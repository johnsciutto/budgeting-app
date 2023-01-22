const { Transaction, Category } = require('../models/index');
const { Validation } = require('../../config/utils/validation');
const { DataPreparation } = require('../../config/utils/dataPreparation');

const addTransaction = async (req, res) => {
  const response = { ok: true, error: null, transactionId: null };
  try {
    const { name, amount, date, note, type, category } = req.body;
    const userId = req.user?.id;

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
  const response = { ok: true, error: null };
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    const { date, name, amount, type, category, note } = req.body;

    if (transactionId === undefined) {
      throw new Error(`No transactionId was passed`);
    }

    if (typeof transactionId !== 'number') {
      throw new Error(
        `Expected transactionId to be a number, received: ${typeof transactionId}`
      );
    }

    const updatedProperties = {};
    if (date) {
      const newDate = new Date(date);
      updatedProperties.date = newDate;
    }
    if (name) updatedProperties.name = name;
    if (amount) updatedProperties.amount = amount;
    if (type) updatedProperties.type = type;
    if (category) updatedProperties.category = category;
    if (note) updatedProperties.date = note;

    const validationResult =
      Validation.isValidPartialTransaction(updatedProperties);

    if (!validationResult.ok) {
      throw new Error(validationResult.error);
    }

    if (updatedProperties.type && updatedProperties.category) {
      const updateCategory = await Category.findOne({
        where: {
          type: updatedProperties.type,
          name: updatedProperties.category,
        },
      });

      if (!updateCategory) {
        throw new Error(
          `The given ${updatedProperties.type} category was not found: ${updatedProperties.category}`
        );
      }

      delete updatedProperties.type;
      delete updatedProperties.category;

      updatedProperties.categoryId = updateCategory.id;
    }

    const result = await Transaction.update(updatedProperties, {
      where: { id: transactionId, userId },
    });

    if (result === 0) {
      throw new Error('The transaction was not modified.');
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const deleteTransaction = async (req, res) => {
  const response = { ok: true, error: null };
  try {
    const userId = req.user?.id;
    const transactionId = req.params.transactionId;

    if (typeof transactionId !== 'number') {
      throw new Error(
        `The transactionId should be a number, instead got: ${typeof transactionId}`
      );
    }

    const result = await Transaction.destroy({
      where: { id: transactionId, userId },
      logging: true,
    });
    if (result === 0) {
      throw new Error(
        `The transaction with the id: ${transactionId} was not deleted from the database`
      );
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const getTransaction = async (req, res) => {
  const response = { ok: true, error: null, transaction: null };
  try {
    const userId = req.user?.id;
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

    if (transaction?.userId !== userId) {
      throw new Error(
        `The transaction with the given id (${transactionId}) was not found.`
      );
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
    const rawData = {
      userId: req.user?.id,
      ...req.query,
    };
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
