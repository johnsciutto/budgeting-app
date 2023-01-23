const { Transaction, Category } = require('../../db/models');
const { Validation } = require('../../utils/validation');
const { DataPreparation } = require('../../utils/dataPreparation');

/**
 * @description - This function is used to add a new transaction to the database. It expects a JSON
 *                object in the request body with the properties 'name', 'amount', 'date', 'note',
 *                'type', and 'category' of the transaction, and uses the 'userId' property from
 *                the request object to associate the transaction with the user.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} response - JSON object with the following properties:
 * @property {boolean} response.ok - Indicates the success or failure of the operation,
 * @property {string | undefined} response.error - A description of the error. Only present if the
 *                                                 operation failed.
 * @property {number | undefined} response.transactionId - The id of the newly created transaction.
 *                                                         Only present if the operation succeeded.
 */
const addTransaction = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const { name, amount, date, note, type, category } = req.body;
    const userId = req.user?.id;

    const isValid = Validation.isValidTransaction({ name, amount, date, note });
    if (!isValid.ok) {
      status = 400;
      throw new Error(isValid.error);
    }

    const dbCategory = await Category.findOne({
      where: { type, name: category },
    });

    if (!dbCategory) {
      status = 404;
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
    res.status(status);
  }
  return res.json(response);
};

/**
 * @description - This function is used to edit an existing transaction in the database.
 *                It expects a JSON object in the request body with the properties of the
 *                transaction to be updated and the 'transactionId' as a parameter in the
 *                request. It uses the 'userId' property from the request object to check
 *                that the user is the owner of the transaction.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.transactionId - The id of the transaction to be updated
 * @param {Object} req.body - The request body
 * @param {string} req.body.date - The new date of the transaction
 * @param {string} req.body.name - The new name of the transaction
 * @param {number} req.body.amount - The new amount of the transaction
 * @param {string} req.body.type - The new type of the transaction's category
 * @param {string} req.body.category - The new category of the transaction
 * @param {string} req.body.note - The new note of the transaction
 * @returns {Object} response - JSON object with
 * @property {boolean} response.ok - Indicates the success or failure of the operation.
 * @property {string | undefined} response.error - A description of the error. Only present
 *                                                 if the operation failed.
 */
const editTransaction = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const userId = req.user?.id;
    const { transactionId } = req.params;
    const { date, name, amount, type, category, note } = req.body;

    if (transactionId === undefined) {
      status = 400;
      throw new Error(`No transactionId was passed`);
    }

    if (typeof transactionId !== 'number') {
      status = 400;
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
      status = 400;
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
        status = 404;
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
    res.status(status);
  }
  return res.json(response);
};

/**
 * @description - This function is used to delete a transaction from the database.
 *                It expects the 'transactionId' as a parameter in the request and
 *                uses the 'userId' property from the request object to check that
 *                the user is the owner of the transaction.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.transactionId - The id of the transaction to be deleted
 * @returns {Object} response - JSON object with the following properties:
 * @property {boolean} response.ok - Indicates the success or failure of the operation.
 * @property {string | undefined} response.error - A description of the error. Only
 *                                                 present if the operation failed.
 */
const deleteTransaction = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const userId = req.user?.id;
    const transactionId = req.params.transactionId;

    if (typeof transactionId !== 'number') {
      status = 400;
      throw new Error(
        `The transactionId should be a number, instead got: ${typeof transactionId}`
      );
    }

    const result = await Transaction.destroy({
      where: { id: transactionId, userId },
      logging: true,
    });
    if (result === 0) {
      status = 400;
      throw new Error(
        `The transaction with the id: ${transactionId} was not deleted from the database`
      );
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }
  return res.json(response);
};

/**
 * @description - This function is used to retrieve a specific transaction from
 *                the database. It expects the 'transactionId' as a parameter
 *                in the request and uses the 'userId' property from the request
 *                object to check that the user is the owner of the transaction.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.params - The request parameters
 * @param {number} req.params.transactionId - The id of the transaction to be retrieved
 * @returns {Object} response - JSON object with the following properties:
 * @property {boolean} response.ok - Indicates the success or failure of the operation.
 * @property {string | undefined} response.error - A description of the error.
 *                                                 Only present if the operation failed.
 * @property {Object | undefined} response.transaction - The transaction object. Only
 *                                                        present if the operation succeeded.
 *
 */
const getTransaction = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const userId = req.user?.id;
    const transactionId = parseInt(req.params.transactionId);

    if (isNaN(transactionId)) {
      status = 400;
      throw new Error(
        `The given transaction id is invalid: ${req.params.transactionId}`
      );
    }

    if (!transactionId) {
      status = 400;
      throw new Error(`The given transaction id is invalid: ${transactionId}`);
    }

    const transaction = await Transaction.findById(transactionId);

    if (transaction?.userId !== userId) {
      status = 404;
      throw new Error(
        `The transaction with the given id (${transactionId}) was not found.`
      );
    }

    response.transaction = transaction;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }
  return res.json(response);
};

/**
 * @description - This function is used to retrieve multiple transactions from
 *                the database. It uses the 'userId' property from the request
 *                object to check that the user is the owner of the transactions
 *                and it uses the query parameters to filter the transactions.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} req.query - The request query parameters
 * @param {number | undefined} req.query.amount - The amount of the transactions
 * @param {number | undefined} req.query.maxAmount - The maximum amount of the transactions
 * @param {number | undefined} req.query.minAmount - The minimum amount of the transactions
 * @param {string | undefined} req.query.category - The category of the transactions
 * @param {string | undefined} req.query.type - The type of the transactions
 * @param {string | undefined} req.query.name - The name of the transactions
 * @param {string | undefined} req.query.note - The note of the transactions
 * @param {string | undefined} req.query.fromDate - The start date of the transactions
 * @param {string | undefined} req.query.toDate - The end date of the transactions
 * @returns {Object} response - JSON object with the following properties:
 * @property {boolean} response.ok - Indicates the success or failure of the operation.
 * @property {string | undefined} response.error - A description of the error. Only
 *                                                 present if the operation failed.
 * @property {Array | undefined} response.transactions - An array of the transactions
 *                                                       objects. Only present if the
 *                                                       operation succeeded.
 * @property {number | undefined} response.transactionCount - A number indicating the
 *                                                            number of transactions
 *                                                            returned. Only present
 *                                                            if the operation succeeded.
 */
const getTransactions = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const rawData = {
      userId: req.user?.id,
      ...req.query,
    };
    const filter = DataPreparation.createTransactionFilter(rawData);

    if (!filter.ok) {
      status = 400;
      throw new Error(filter.error);
    }

    const result = await Transaction.findAllFiltered(filter.data);
    response.transactions = result.transactions;
    response.transactionCount = result.transactionCount;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
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
