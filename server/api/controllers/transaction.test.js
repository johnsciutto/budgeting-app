const { Op } = require('sequelize');
const { describe, test, expect } = require('@jest/globals');
const { Transaction, Category } = require('../../db/models');
const { DataPreparation } = require('../../utils/dataPreparation');
const {
  addTransaction,
  getTransaction,
  getTransactions,
  editTransaction,
  deleteTransaction,
} = require('./transaction');
const { Validation } = require('../../utils/validation');

describe('transaction controller', () => {
  const res = {
    status: () => null,
    json: (str) => JSON.stringify(str),
  };

  describe('addTransaction', () => {
    let req = null;

    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
        body: {
          date: new Date(),
          name: 'Supermarket',
          amount: 130.5,
          note: 'this is a note',
          type: 'expense',
          category: 'groceries',
        },
        params: {
          userId: 1,
        },
      };
    });

    test('should fail if the transaction is not valid', async () => {
      req.body.name = 123;

      const mockValidation = jest
        .spyOn(Validation, 'isValidTransaction')
        .mockReturnValue({
          ok: false,
          error: "The transaction's name should be a valid non-empty string.",
        });
      expect(JSON.parse(await addTransaction(req, res))).toMatchObject({
        ok: false,
        error: "The transaction's name should be a valid non-empty string.",
      });

      expect(mockValidation).toHaveBeenCalledTimes(1);
    });

    test('should fail if the category passed in was not found in the database.', async () => {
      req.body.category = 'not-found-category';

      const mockFindOne = jest.spyOn(Category, 'findOne').mockReturnValue(null);

      const result = JSON.parse(await addTransaction(req, res));
      expect(result).toMatchObject({
        ok: false,
        error:
          'The "expense" category of "not-found-category" was not found in the database.',
      });
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });

    test('should fail if the transaction was not created successfully.', async () => {
      const mockValidTransaction = jest
        .spyOn(Validation, 'isValidTransaction')
        .mockReturnValue({ ok: true });
      const mockFindOne = jest.spyOn(Category, 'findOne').mockReturnValue({
        id: 1,
        type: 'income',
        name: 'testing-income-category',
      });
      const mockCreateTransaction = jest
        .spyOn(Transaction, 'create')
        .mockReturnValue(null);

      const result = JSON.parse(await addTransaction(req, res));
      expect(result).toMatchObject({ ok: false });
      expect(mockValidTransaction).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockCreateTransaction).toHaveBeenCalledTimes(1);
    });

    test('should create a transaction in the database if the data is valid', async () => {
      const mockValidTransaction = jest
        .spyOn(Validation, 'isValidTransaction')
        .mockReturnValue({ ok: true });
      const mockFindOne = jest.spyOn(Category, 'findOne').mockReturnValue({
        id: 1,
        type: 'income',
        name: 'Paycheck',
      });
      const mockCreateTransaction = jest
        .spyOn(Transaction, 'create')
        .mockReturnValue({ id: 1 });

      const result = JSON.parse(await addTransaction(req, res));
      expect(result).toMatchObject({ ok: true, transactionId: 1 });
      expect(mockValidTransaction).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledTimes(1);
      expect(mockCreateTransaction).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('getTransaction', () => {
    let req = null;
    const res = {
      status: () => null,
      json: (str) => JSON.stringify(str),
    };

    beforeEach(() => {
      req = {
        params: {
          transactionId: 1,
        },
        user: {
          id: 1,
        },
      };
    });

    test('should create an error object if there is no transactionId passed', async () => {
      req.params.transactionId = undefined;
      const result = JSON.parse(await getTransaction(req, res));
      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result.error).toBe(
        'The given transaction id is invalid: undefined'
      );
    });

    test('should create an error object if the transactionId is not an interger', async () => {
      req.params.transactionId = 'testing';
      const result = JSON.parse(await getTransaction(req, res));
      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('The given transaction id is invalid: testing');
    });

    test('should create an error object if the transaction with the given id is not found on the database', async () => {
      req.params.transactionId = '111';

      jest.spyOn(Transaction, 'findById').mockResolvedValue(null);

      const result = JSON.parse(await getTransaction(req, res));
      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result.error).toBe(
        `The transaction with the given id (${req.params.transactionId}) was not found.`
      );
    });

    test('should create a success object if a valid transactionId is passed', async () => {
      req.params.transactionId = '10';

      jest.spyOn(Transaction, 'findById').mockResolvedValue({
        name: 'Supermarket',
        date: 'jan-01-2022',
        amount: 100,
        note: 'this iis a note',
        userId: 1,
        type: 'expense',
        category: 'Groceries',
      });

      const result = JSON.parse(await getTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
      expect(result).toHaveProperty('transaction');
      expect(result.transaction).toStrictEqual({
        name: 'Supermarket',
        date: 'jan-01-2022',
        amount: 100,
        note: 'this iis a note',
        userId: 1,
        type: 'expense',
        category: 'Groceries',
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('getTransactions', () => {
    let req = null;
    const res = {
      status: () => null,
      json: (str) => JSON.stringify(str),
    };

    beforeEach(() => {
      req = {
        params: {
          userId: 1,
        },
      };
    });

    test('should return an error if there is no userId passed in the params', async () => {
      req.params.userId = null;
      const result = JSON.parse(await getTransactions(req, res));
      expect(result).toMatchObject({
        ok: false,
        error: 'The filter object needs to have a userId property.',
      });
    });

    test('should produce filtered results with the category included', async () => {
      const findAllFilteredMockResults = {
        transactions: [
          {
            id: 1,
            name: 'Salary',
            date: '2023-01-09T11:27:52.375Z',
            amount: 2000,
            note: null,
            type: 'income',
            category: 'paycheck',
          },
          {
            id: 2,
            name: 'Rent',
            date: '2023-01-09T11:27:52.375Z',
            amount: 1000,
            note: null,
            type: 'expense',
            category: 'home',
          },
        ],
        transactionCount: 2,
      };

      req.params = {
        userId: 1,
        minAmount: 10,
        fromDate: 'jan-01-2022',
      };

      jest.spyOn(DataPreparation, 'createTransactionFilter').mockReturnValue({
        ok: true,
        data: {
          userId: 1,
          amount: {
            [Op.gt]: 10,
          },
          date: {
            [Op.gt]: new Date('jan-01-2022'),
          },
        },
      });

      jest
        .spyOn(Transaction, 'findAllFiltered')
        .mockResolvedValue(findAllFilteredMockResults);

      const result = JSON.parse(await getTransactions(req, res));
      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
      expect(result).toHaveProperty('transactions');
      expect(result.transactions).toContainEqual({
        id: 1,
        name: 'Salary',
        date: '2023-01-09T11:27:52.375Z',
        amount: 2000,
        note: null,
        type: 'income',
        category: 'paycheck',
      });
      expect(result.transactions).toContainEqual({
        id: 2,
        name: 'Rent',
        date: '2023-01-09T11:27:52.375Z',
        amount: 1000,
        note: null,
        type: 'expense',
        category: 'home',
      });
      expect(result).toHaveProperty('transactionCount');
      expect(result.transactionCount).toBe(2);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('deleteTransaction', () => {
    let req = null;
    const res = {
      status: () => null,
      json: (str) => JSON.stringify(str),
    };

    beforeEach(() => {
      req = { params: { transactionId: 1 } };
    });

    test("should delete the transaction if it's found in the database.", async () => {
      jest.spyOn(Transaction, 'destroy').mockResolvedValue(1);

      const result = JSON.parse(await deleteTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
    });

    test('should throw an error if the transactionId is not a number.', async () => {
      req.params.transactionId = 'testing';
      const result1 = JSON.parse(await deleteTransaction(req, res));

      expect(result1).toHaveProperty('ok');
      expect(result1.ok).toBe(false);
      expect(result1).toHaveProperty('error');
      expect(result1.error).toBe(
        'The transactionId should be a number, instead got: NaN'
      );

      req.params.transactionId = true;
      const result2 = JSON.parse(await deleteTransaction(req, res));

      expect(result2).toHaveProperty('ok');
      expect(result2.ok).toBe(false);
      expect(result2).toHaveProperty('error');
      expect(result2.error).toBe(
        'The transactionId should be a number, instead got: NaN'
      );
    });

    test('should throw an error if the delete operation failed.', async () => {
      jest.spyOn(Transaction, 'destroy').mockResolvedValue(0);

      const result = JSON.parse(await deleteTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        'The transaction with the id: 1 was not found in the database'
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('editTransaction', () => {
    let req = null;
    const res = {
      status: () => null,
      json: (str) => JSON.stringify(str),
    };

    beforeEach(() => {
      req = {
        params: { transactionId: 1 },
        body: {},
      };
    });

    test('should return an error object if there is no transactionId passed', async () => {
      req.params.transactionId = undefined;

      const result = JSON.parse(await editTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('No transactionId was passed');
    });

    test('should return an error object if the transactionId is invalid', async () => {
      req.params.transactionId = 'testing';

      const result = JSON.parse(await editTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        'Expected transactionId to be a number, received: testing'
      );
    });

    test('shoud return an error object if the validation of the properties fails', async () => {
      req.body.amount = 'testing';

      jest.spyOn(Validation, 'isValidPartialTransaction').mockReturnValue({
        ok: false,
        error: 'The amount is not a valid number',
      });

      const result = JSON.parse(await editTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('The amount is not a valid number');
    });

    test("should return an error object if the user doesn't have the provided category", async () => {
      req.body.type = 'income';
      req.body.category = 'Business';

      jest.spyOn(Category, 'findOne').mockResolvedValue(null);

      const result = JSON.parse(await editTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given ${req.body.type} category was not found: ${req.body.category}`
      );
    });

    test('should update the transaction with the new type and category', async () => {
      req.body.type = 'expense';
      req.body.category = 'Takeout';

      jest
        .spyOn(Category, 'findOne')
        .mockResolvedValue({ id: 5, type: 'expense', name: 'Takeout' });
      jest.spyOn(Transaction, 'update').mockResolvedValue(1);

      const result = JSON.parse(await editTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
    });

    test('should update the properties of an object in the database successfully', async () => {
      req.body.amount = 120.5;

      jest.spyOn(Transaction, 'update').mockResolvedValue(1);

      const result = JSON.parse(await editTransaction(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });
});
