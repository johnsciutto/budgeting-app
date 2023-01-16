const jwt = require('jsonwebtoken');
const {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} = require('@jest/globals');
const User = require('../models/user');
const { Validation } = require('../../config/utils/validation');
const { Security } = require('../../config/utils/security');
const { registerUser, loginUser, editUser, deleteUser } = require('./users');

describe('users controller', () => {
  describe('registerUser', () => {
    let req = null;
    let res = null;

    beforeEach(() => {
      req = {
        body: {
          username: 'john',
          email: 'john@test.com',
          password: 'password12345',
        },
      };
      res = {
        json: (str) => JSON.stringify(str),
        setHeader: () => true,
      };
    });

    test('should return object with error if username already exists', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ name: 'john ' });

      expect(JSON.parse(await registerUser(req, res))).toMatchObject({
        ok: false,
        error: 'That username is already taken, please choose another one.',
      });
    });

    test('should return an error if the email is not valid', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(Validation, 'isEmailValid')
        .mockReturnValue({ ok: false, error: 'The email is invalid' });

      expect(JSON.parse(await registerUser(req, res))).toMatchObject({
        ok: false,
        error: 'The email is invalid',
      });
    });

    test('should return an error if the password is not valid', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(Validation, 'isEmailValid').mockReturnValue({ ok: true });
      jest
        .spyOn(Validation, 'isPasswordValid')
        .mockReturnValue({ ok: false, error: 'The password is invalid.' });

      expect(JSON.parse(await registerUser(req, res))).toMatchObject({
        ok: false,
        error: 'The password is invalid.',
      });
    });

    test('should create a new user in the database', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        id: 1,
        username: 'john',
        email: 'john@test.com',
        password: 'dafasdf423424dasfsd',
      });
      jest.spyOn(Validation, 'isEmailValid').mockReturnValue({ ok: true });
      jest.spyOn(Validation, 'isPasswordValid').mockReturnValue({ ok: true });
      jest.spyOn(jwt, 'sign').mockReturnValue('jwtstringhere');

      const result = JSON.parse(await registerUser(req, res));

      expect(result).toMatchObject({
        ok: true,
        token: 'jwtstringhere',
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('loginUser', () => {
    let req = null;
    const res = { json: (str) => JSON.stringify(str) };

    beforeEach(() => {
      req = {
        body: {
          username: 'john',
          password: 'test12345',
        },
      };
    });

    test('should return an error if the user is not found in the database', async () => {
      jest.spyOn(User, 'findOne').mockReturnValue(null);
      expect(JSON.parse(await loginUser(req, res))).toMatchObject({
        ok: false,
        error: 'Invalid username or password',
      });
    });

    test("should return an error if the password doesn't match the one stored in the database", async () => {
      jest.spyOn(User, 'findOne').mockReturnValue({ id: 1 });
      jest.spyOn(Security, 'isUserPassword').mockReturnValue(false);
      expect(JSON.parse(await loginUser(req, res))).toMatchObject({
        ok: false,
        error: 'Invalid username or password',
      });
    });

    test("should return an object with 'ok' and a token if the user is found and the password is correct", async () => {
      res.setHeader = () => true;
      jest.spyOn(User, 'findOne').mockReturnValue({ id: 1 });
      jest.spyOn(Security, 'isUserPassword').mockReturnValue(true);
      jest.spyOn(Security, 'generateToken').mockReturnValue('jwtstringhere');

      const result = JSON.parse(await loginUser(req, res));
      expect(result).toMatchObject({
        ok: true,
        token: 'jwtstringhere',
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('editUser', () => {
    let req = null;
    const res = { json: (str) => JSON.stringify(str) };

    beforeEach(() => {
      req = {
        params: { userId: 1 },
      };
    });

    test('should return an error if the username passed is already taken', async () => {
      req = { ...req, body: { username: 'john' } };
      jest.spyOn(User, 'findOne').mockResolvedValue({ id: 1 });
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: false,
        error: `That username is already taken.`,
      });
    });

    test('should throw an error if the oldPassword is passed, but the newPassword is not', async () => {
      req = { ...req, body: { oldPassword: 'testing12345' } };
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: false,
        error: 'One of the passwords is missing.',
      });
    });

    test('should throw an error if the newPassword is passed, but the oldPassword is not', async () => {
      req = { ...req, body: { newPassword: 'testing12345' } };
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: false,
        error: 'One of the passwords is missing.',
      });
    });

    test('should update the username if the new username is not found', async () => {
      req = {
        ...req,
        body: {
          username: 'new_john_username',
        },
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'update').mockResolvedValue([1]);
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: true,
      });
    });

    test('should update the email if it is passed in the body', async () => {
      req = {
        ...req,
        body: {
          email: 'john@test.com',
        },
      };
      jest.spyOn(User, 'update').mockResolvedValue([1]);
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: true,
      });
    });

    test("should fail to update the passwords if the oldPassword doesn't match the one stored for that user", async () => {
      req = {
        ...req,
        body: { oldPassword: 'testing11111', newPassword: 'testing12345' },
      };
      jest.spyOn(User, 'findByPk').mockResolvedValue({
        id: 1,
        username: 'john',
        password: 'hashedpassword12345',
      });
      jest.spyOn(Security, 'isUserPassword').mockReturnValue(false);
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: false,
        error: 'The given (existing) password is not correct.',
      });
    });

    test('should fail if the new password is not valid', async () => {
      req = {
        ...req,
        body: { oldPassword: 'testing11111', newPassword: 'testing12345' },
      };
      jest
        .spyOn(Validation, 'isPasswordValid')
        .mockReturnValue({ ok: false, error: 'The password is invalid' });
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: false,
        error: 'The password is invalid',
      });
    });

    test('should return an error if the update to the database failed', async () => {
      req = { ...req, body: { username: 'john_new_username' } };
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'update').mockResolvedValue([0]);
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: false,
        error: 'The user data was not updated.',
      });
    });

    test('should update the passwords if both oldPassword and newPassword are in the body and both are correct', async () => {
      req = {
        ...req,
        body: { oldPassword: 'testing11111', newPassword: 'testing12345' },
      };
      jest.spyOn(User, 'findByPk').mockResolvedValue({
        id: 1,
        username: 'john',
        password: 'hashedpassword12345',
      });
      jest.spyOn(Security, 'isUserPassword').mockReturnValue(true);
      jest.spyOn(Validation, 'isPasswordValid').mockReturnValue({ ok: true });
      jest
        .spyOn(Security, 'hashPassword')
        .mockReturnValue({ ok: true, password: 'newHashedPassword12345' });
      jest.spyOn(User, 'update').mockResolvedValue([1]);
      expect(JSON.parse(await editUser(req, res))).toMatchObject({
        ok: true,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe('deleteUser', () => {
    let req = null;
    const res = { json: (str) => JSON.stringify(str) };

    beforeEach(() => {
      req = { user: { id: 1 } };
    });

    test('should fail if the userId is missing', async () => {
      req.user.id = null;
      expect(JSON.parse(await deleteUser(req, res))).toMatchObject({
        ok: false,
        error: 'The userId is incorrect: null',
      });
    });

    test('should fail if the the user with the given userId is not found', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue(null);
      expect(JSON.parse(await deleteUser(req, res))).toMatchObject({
        ok: false,
        error: 'No user was found with the given id: 1',
      });
    });

    test('should fail if the user was not deleted from the database', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
      jest.spyOn(User, 'destroy').mockResolvedValue(0);
      expect(JSON.parse(await deleteUser(req, res))).toMatchObject({
        ok: false,
        error: 'The operation to delete the user failed.',
      });
    });

    test('should succeed if the userId is valid', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue({ id: 1 });
      jest.spyOn(User, 'destroy').mockResolvedValue(1);
      expect(JSON.parse(await deleteUser(req, res))).toMatchObject({
        ok: true,
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });
});
