const { describe, test, expect } = require('@jest/globals');
const { User, Category } = require('../../db/models');
const { getCategories, addCategory, deleteCategory } = require('./category');

describe('category controller', () => {
  let req = null;
  const res = {
    status: () => null,
    json: (str) => JSON.stringify(str),
  };

  describe('getCategories', () => {
    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
        body: {},
      };
    });

    test('should create an error object if there is no user id passed.', async () => {
      req.user.id = undefined;

      const result = JSON.parse(await getCategories(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.user.id}`
      );
    });

    test('should create an error object if the user id is not valid.', async () => {
      req.user.id = 'testing';

      const result = JSON.parse(await getCategories(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.user.id}`
      );
    });

    test('should create an error object if the user is not found in the database.', async () => {
      req.user.id = 1234321;

      jest.spyOn(User, 'findById').mockResolvedValue(null);

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
    req.user.id = 1;

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
      req.user.id = undefined;

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.user.id}`
      );
    });

    test('should create an error object if the user id is not valid.', async () => {
      req.user.id = 'testing';

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.user.id}`
      );
    });

    test('should create an error object if the user was not found in the database', async () => {
      req.user.id = 1234321;

      jest.spyOn(User, 'findById').mockResolvedValue(null);

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user was not found in the database.`
      );
    });

    test('should return a success object if the category was added to the user', async () => {
      req.user.id = 1;
      req.body.type = 'expense';
      req.body.category = 'New Category';

      jest.spyOn(User, 'findByPk').mockResolvedValue({
        userId: 1,
        username: 'john',
        email: 'john@test.com',
      });
      jest.spyOn(User, 'addCategory').mockResolvedValue({
        ok: true,
        categories: {
          income: ['Paycheque', 'Business'],
          expense: ['Takeout', 'Groceries', 'New Category'],
        },
      });

      const result = JSON.parse(await addCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(null);
      expect(result).toHaveProperty('categories');
      expect(result.categories).toMatchObject({
        income: ['Paycheque', 'Business'],
        expense: ['Takeout', 'Groceries', 'New Category'],
      });
    });
  });

  describe('deleteCategory', () => {
    beforeEach(() => {
      req = {
        user: {
          id: 1,
        },
        body: {},
      };
    });

    test('should exist', () => {
      expect(deleteCategory).not.toBeUndefined();
    });

    test('should create an error object if there is no user id passed.', async () => {
      req.user.id = undefined;

      const result = JSON.parse(await deleteCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.user.id}`
      );
    });

    test('should create an error object if the user id is not valid.', async () => {
      req.user.id = 'testing';

      const result = JSON.parse(await deleteCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user id was not found: ${req.user.id}`
      );
    });

    test('should create an error object if the user was not found in the database', async () => {
      req.user.id = 1234321;

      jest.spyOn(User, 'findById').mockResolvedValue(null);

      const result = JSON.parse(await deleteCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The given user was not found in the database.`
      );
    });

    test('should create an error object if the category was not found for that user', async () => {
      req.user.id = 1;
      req.body = {
        type: 'expense',
        category: 'Groceries',
      };

      jest.spyOn(User, 'findById').mockResolvedValue({
        userId: 1,
        username: 'john',
        email: 'john@testing.com',
        removeCategory: async () => 0,
      });
      jest
        .spyOn(Category, 'findOne')
        .mockResolvedValue({ id: 12, type: 'expense', name: 'Groceries' });

      const result = JSON.parse(await deleteCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(
        `The ${req.body.type} with a name of ${req.body.category} was not deleted for the user with the id of ${req.user.id}.`
      );
    });

    test('should create a success object if the category was deleted for that user', async () => {
      req.user.id = 1;
      req.body = {
        type: 'expense',
        category: 'Groceries',
      };

      jest.spyOn(User, 'findById').mockResolvedValue({
        userId: 1,
        username: 'john',
        email: 'john@testing.com',
        removeCategory: async () => 1,
      });
      jest
        .spyOn(Category, 'findOne')
        .mockResolvedValue({ id: 12, type: 'expense', name: 'Groceries' });

      const result = JSON.parse(await deleteCategory(req, res));

      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(true);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe(null);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
