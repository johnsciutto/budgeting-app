const { Transaction, User, Category } = require('../models/index');
const { describe, test, expect } = require('@jest/globals');
const {
  addTransaction,
  getTransaction,
  getTransactions,
  editTransaction,
  deleteTransaction,
} = require('./transaction');
const { Validation } = require('../../config/utils/validation');

describe('transaction controller', () => {
  const res = {
    json: (str) => JSON.stringify(str),
  };

  describe('addTransaction', () => {
    let req = null;

    beforeEach(() => {
      req = {
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
      expect(result).toMatchObject({ ok: false, transactionId: null });
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

  describe('editTransaction', () => {
    test.todo('...');
  });

  describe('deleteTransaction', () => {
    test.todo('...');
  });

  describe('getTransaction', () => {
    test.todo('...');
  });

  describe('getTransactions', () => {
    test.todo('...');
  });
});
