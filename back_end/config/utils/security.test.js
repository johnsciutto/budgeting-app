const { describe, test, expect } = require('@jest/globals');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Security } = require('./security');

describe('Security', () => {
  test('should exist', () => {
    expect(Security).not.toBeNull();
  });

  test('should have a SALT_ROUNDS static property that is an interger greater or equal to 10', () => {
    expect(Security.SALT_ROUNDS).not.toBeNull();
    expect(Security.SALT_ROUNDS).toBeGreaterThanOrEqual(10);
  });

  describe('hashPassword', () => {
    test('should exist', () => {
      expect(Security.hashPassword).not.toBeUndefined();
    });

    test('should fail if the parameter is not a string', async () => {
      expect(await Security.hashPassword(123)).toMatchObject({ ok: false });
    });

    test('should produce a hashed password', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword1234');
      const result = await Security.hashPassword('testing');
      expect(result).toMatchObject({
        ok: true,
        password: 'hashedpassword1234',
      });
    });
  });

  describe('isUserPassword', () => {
    test('should exist', () => {
      expect(Security.isUserPassword).not.toBeUndefined();
    });
  });

  describe('generateToken', () => {
    test('should exist', () => {
      expect(Security.generateToken).not.toBeUndefined();
    });

    test('it should throw an error if no user id was given', () => {
      expect(() => Security.generateToken()).toThrowError();
    });

    test('it should throw an error if no user secret or private key was given', () => {
      expect(() => Security.generateToken()).toThrowError();
    });

    test('it should create a token with the claims "iss", "sub", "iat" and "exp"', () => {
      const result = Security.generateToken(1);
      const decoded = jwt.decode(result);
      expect(decoded).toHaveProperty('iss');
      expect(decoded.iss).toBe('BudgetingApp');
      expect(decoded).toHaveProperty('sub');
      expect(decoded.sub).toBe(1);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    test('should be able to take in a second parameter with the number of days to expire the token', () => {
      const numberOfDays = 30;
      const result = Security.generateToken(1, numberOfDays);
      const decoded = jwt.decode(result);
      expect(decoded).toHaveProperty('sub');
      expect(decoded.sub).toBe(1);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeCloseTo(
        Math.floor(Date.now() / 1000) + numberOfDays * 24 * 60 * 60
      );
    });
  });
});
