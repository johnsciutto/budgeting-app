const { describe, test, expect } = require('@jest/globals');
const { Transaction, User, Category } = require('../models/index');
const { getCategories, addCategory, deleteCategory } = require('./category');

describe('category controller', () => {
  let req = null;
  const res = {
    json: (str) => JSON.stringify(str),
  };

  describe('getCategories', () => {
    beforeEach(() => {
      req = {
        params: {
          userId: 1,
        },
        body: {},
      };
    });

    test('should create an error object if there is no user id passed.', async () => {
      req.params.userId = undefined;

      const result = JSON.parse(await getCategories(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.params.userId}`
      );
    });

    test('should create an error object if the user id is not valid.', async () => {
      req.params.userId = 'testing';

      const result = JSON.parse(await getCategories(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.params.userId}`
      );
    });

    test('should create an error object if the user is not found in the database.', async () => {
      req.params.userId = 1234321;

      jest.spyOn(User, 'findByPk').mockResolvedValue(null);

      const result = JSON.parse(await getCategories(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user was not found in the database.`
      );
    });
  });

  test('should produce an object with the categories if the user has categories', async () => {
    req.params.userId = 1;

    const mockedGetAllCategoriesResult = {
      income: ['Paycheque', 'Etsy Shop'],
      expense: ['Groceries', 'Takeout', 'Home'],
    };

    jest
      .spyOn(User, 'getAllCategories')
      .mockResolvedValue(mockedGetAllCategoriesResult);

    const result = JSON.parse(await getCategories(req, res));

    expect(result).toHaveProperty('ok');
    expect(result.ok).toBe(true);
    expect(result).toHaveProperty('error');
    expect(result.error).toBe(null);
    expect(result).toHaveProperty('categories');
    expect(result.categories).toMatchObject(mockedGetAllCategoriesResult);
    expect(result.categories.income).toEqual(
      mockedGetAllCategoriesResult.income
    );
    expect(result.categories.expense).toEqual(
      mockedGetAllCategoriesResult.expense
    );
  });

  describe('addCategory', () => {
    test('should create an error object if there is no user id passed.', async () => {
      req.params.userId = undefined;

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.params.userId}`
      );
    });

    test('should create an error object if the user id is not valid.', async () => {
      req.params.userId = 'testing';

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.params.userId}`
      );
    });

    test('should create an error object if the user was not found in the database', async () => {
      req.params.userId = 1234321;

      jest.spyOn(User, 'findByPk').mockResolvedValue(null);

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user was not found in the database.`
      );
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
