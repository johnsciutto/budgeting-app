const { describe, test, expect } = require('@jest/globals');
const { DataPreparation } = require('./dataPreparation');
const { Op } = require('sequelize');

describe('DataPreparation', () => {
  describe('createTransactionFilter', () => {
    test('should create a filter object with the fromDate and userId only', () => {
      const filterData = {
        userId: 1,
        fromDate: 'jan-13-2022',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.data.date).toMatchObject({
        [Op.gt]: new Date('jan-13-2022'),
      });
    });

    test('should create a filter object with the toDate and userId only', () => {
      const filterData = {
        userId: 1,
        toDate: 'jan-13-2022',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.data.date).toMatchObject({
        [Op.lt]: new Date('jan-13-2022'),
      });
    });

    test('should create a filter object with both the fromDate and toDate', () => {
      const filterData = {
        userId: 1,
        fromDate: 'jan-01-2022',
        toDate: 'jan-13-2022',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.data.date).toMatchObject({
        [Op.gt]: new Date('jan-01-0022'),
        [Op.lt]: new Date('jan-13-2022'),
      });
    });

    test('should create an error object if the fromDate is not a valid date', () => {
      const filterData = {
        userId: 1,
        fromDate: 'yesterday',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result).toMatchObject({
        ok: false,
        error: 'The given fromDate is invalid: yesterday',
        data: null,
      });
    });

    test('should create an error object if the toDate is not a valid date', () => {
      const filterData = {
        userId: 1,
        toDate: 'tomorrow',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result).toMatchObject({
        ok: false,
        error: 'The given toDate is invalid: tomorrow',
        data: null,
      });
    });

    test('should create an object with the amount if it is given', () => {
      const filterData = {
        userId: 1,
        amount: 123.5,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.data).toMatchObject({
        amount: 123.5,
      });
    });

    test('should create an error object if the given amount is an invalid string', () => {
      const filterData = {
        userId: 1,
        amount: 'a lot',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result).toMatchObject({
        ok: false,
        data: null,
        error: 'The given amount is not valid: a lot',
      });
    });

    test('should create an error object if the given minAmount is an invalid string', () => {
      const filterData = {
        userId: 1,
        minAmount: 'a lot',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result).toMatchObject({
        ok: false,
        data: null,
        error: 'The given minAmount is not valid: a lot',
      });
    });

    test('should create an error object if the given maxAmount is an invalid string', () => {
      const filterData = {
        userId: 1,
        maxAmount: 'a lot',
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result).toMatchObject({
        ok: false,
        data: null,
        error: 'The given maxAmount is not valid: a lot',
      });
    });

    test('should create a valid filter object if only a minAmount is given', () => {
      const filterData = {
        userId: 1,
        minAmount: 100,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toMatchObject({
        amount: { [Op.gt]: 100 },
      });
      expect(result.data.amount).toHaveProperty([Op.gt]);
      expect(result.data.amount[Op.gt]).toBe(100);
    });

    test('should create a valid filter object if only a maxAmount is given', () => {
      const filterData = {
        userId: 1,
        maxAmount: 100,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toMatchObject({
        amount: { [Op.lt]: 100 },
      });
      expect(result.data.amount).toHaveProperty([Op.lt]);
      expect(result.data.amount[Op.lt]).toBe(100);
    });

    test('should create a valid filter object if both maxAmount and minAmount are given', () => {
      const filterData = {
        userId: 1,
        minAmount: 50,
        maxAmount: 100,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toMatchObject({
        amount: { [Op.lt]: 100, [Op.gt]: 50 },
      });
      expect(result.data.amount).toHaveProperty([Op.lt]);
      expect(result.data.amount).toHaveProperty([Op.gt]);
      expect(result.data.amount[Op.gt]).toBe(50);
      expect(result.data.amount[Op.lt]).toBe(100);
    });

    test('should only add the amount if both a maxAmount and an amount are given', () => {
      const filterData = {
        userId: 1,
        amount: 50,
        maxAmount: 100,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toMatchObject({
        amount: 50,
      });
      expect(result.data.amount).not.toHaveProperty([Op.lt]);
      expect(result.data.amount).toBe(50);
    });

    test('should only add the amount if both a minAmount and an amount are given', () => {
      const filterData = {
        userId: 1,
        amount: 50,
        minAmount: 100,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data.amount).not.toHaveProperty([Op.gt]);
      expect(result.data).toMatchObject({
        amount: 50,
      });
      expect(result.data.amount).toBe(50);
    });

    test('should only add the amount if a minAmount, maxAmount and an amount are given', () => {
      const filterData = {
        userId: 1,
        amount: 50,
        minAmount: 10,
        maxAmount: 101,
      };
      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data.amount).not.toHaveProperty([Op.lt]);
      expect(result.data.amount).not.toHaveProperty([Op.gt]);
      expect(result.data).toMatchObject({
        amount: 50,
      });
      expect(result.data.amount).toBe(50);
    });

    test('should add a name if it is given', () => {
      const filterData = {
        userId: 1,
        name: 'testing',
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toHaveProperty('name');
      expect(result.data.name).toBe('testing');
    });

    test('should create an error object if the name is not a valid string', () => {
      const filterData = {
        userId: 1,
        name: true,
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('The given name is not valid: true');
      expect(result.data).toBe(null);
    });

    test('should add a note if it is given', () => {
      const filterData = {
        userId: 1,
        note: 'testing',
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toHaveProperty('note');
      expect(result.data.note).toBe('testing');
    });

    test('should create an error object if the note is not a valid string', () => {
      const filterData = {
        userId: 1,
        note: true,
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('The given note is not valid: true');
      expect(result.data).toBe(null);
    });

    test('should create an error object if the type given is not either "income" or "expense"', () => {
      const filterData = {
        userId: 1,
        type: 'testing',
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('The given type is not valid: testing');
      expect(result.data).toBe(null);
    });

    test('should add a type to the results object if it\'s either "income" or "expense"', () => {
      const filterData1 = {
        userId: 1,
        type: 'income',
      };

      const filterData2 = {
        userId: 1,
        type: 'expense',
      };

      const result1 = DataPreparation.createTransactionFilter(filterData1);
      expect(result1.ok).toBe(true);
      expect(result1.error).toBe(null);
      expect(result1.data).toMatchObject({
        type: 'income',
      });

      const result2 = DataPreparation.createTransactionFilter(filterData2);
      expect(result2.ok).toBe(true);
      expect(result2.error).toBe(null);
      expect(result2.data).toMatchObject({
        type: 'expense',
      });
    });

    test('should add a category if it is given', () => {
      const filterData = {
        userId: 1,
        category: 'testing',
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toHaveProperty('category');
      expect(result.data.category).toBe('testing');
    });

    test('should create an error object if the category is not a valid string', () => {
      const filterData = {
        userId: 1,
        category: true,
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('The given category is not valid: true');
      expect(result.data).toBe(null);
    });

    test('should create a filter object with a from date and a min amount', () => {
      const filterData = {
        userId: 1,
        fromDate: 'jan-01-2022',
        minAmount: 100,
      };

      const result = DataPreparation.createTransactionFilter(filterData);
      expect(result.ok).toBe(true);
      expect(result.error).toBe(null);
      expect(result.data).toHaveProperty('date');
      expect(result.data).toHaveProperty('amount');
      expect(result.data.date).toHaveProperty([Op.gt]);
      expect(result.data.date[Op.gt]).toStrictEqual(
        new Date(filterData.fromDate)
      );
      expect(result.data.amount).toHaveProperty([Op.gt]);
      expect(result.data.amount[Op.gt]).toBe(100);
    });
  });
});
