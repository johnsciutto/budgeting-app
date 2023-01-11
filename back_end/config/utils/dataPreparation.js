const { Op } = require('sequelize');

class DataPreparation {
  constructor() {}

  static createTransactionFilter(rawData) {
    const result = { ok: true, error: null, data: {} };
    try {
      // userId
      if (!rawData.userId) {
        throw new Error('The filter object needs to have a userId property.');
      }

      result.data.userId = rawData.userId;

      // date
      if (rawData.fromDate) {
        const fromDate = new Date(rawData.fromDate);

        if (fromDate.toString() === 'Invalid Date') {
          throw new Error(`The given fromDate is invalid: ${rawData.fromDate}`);
        }

        result.data.date = {
          [Op.gt]: fromDate,
        };
      }

      if (rawData.toDate) {
        const toDate = new Date(rawData.toDate);

        if (toDate.toString() === 'Invalid Date') {
          throw new Error(`The given toDate is invalid: ${rawData.toDate}`);
        }

        result.data.date = {
          ...result.data.date,
          [Op.lt]: toDate,
        };
      }

      // amount
      if (rawData.amount) {
        const parsedAmount = parseFloat(rawData.amount);
        if (isNaN(parsedAmount)) {
          throw new Error(`The given amount is not valid: ${rawData.amount}`);
        }

        result.data.amount = parsedAmount;
      } else if (rawData.minAmount || rawData.maxAmount) {
        result.data.amount = {};
        if (rawData.minAmount) {
          const parsedAmount = parseFloat(rawData.minAmount);
          if (isNaN(parsedAmount)) {
            throw new Error(
              `The given minAmount is not valid: ${rawData.minAmount}`
            );
          }

          result.data.amount[Op.gt] = parsedAmount;
        }
        if (rawData.maxAmount) {
          const parsedAmount = parseFloat(rawData.maxAmount);
          if (isNaN(parsedAmount)) {
            throw new Error(
              `The given maxAmount is not valid: ${rawData.maxAmount}`
            );
          }

          result.data.amount[Op.lt] = parsedAmount;
          //
        }
      }

      // name
      if (rawData.name) {
        if (typeof rawData.name !== 'string') {
          throw new Error(`The given name is not valid: ${rawData.name}`);
        }
        result.data.name = rawData.name;
      }

      // note
      if (rawData.note) {
        if (typeof rawData.note !== 'string') {
          throw new Error(`The given note is not valid: ${rawData.note}`);
        }
        result.data.note = rawData.note;
      }

      // type
      if (rawData.type) {
        if (!['income', 'expense'].includes(rawData.type)) {
          throw new Error(`The given type is not valid: ${rawData.type}`);
        }

        result.data.type = rawData.type;
      }

      // category
      if (rawData.category) {
        if (typeof rawData.category !== 'string') {
          throw new Error(
            `The given category is not valid: ${rawData.category}`
          );
        }

        result.data.category = rawData.category;
      }
    } catch (err) {
      result.ok = false;
      result.error = err.message;
      result.data = null;
    }

    return result;
  }
}

module.exports = { DataPreparation };
