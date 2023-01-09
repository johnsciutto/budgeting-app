const { describe, test, expect } = require('@jest/globals');
const { Validation } = require('./validation');

describe('Validation', () => {
  test('should exist', () => {
    expect(Validation).not.toBeUndefined();
  });

  test('should have a RULES static property with a password and email properties', () => {
    expect(Validation.RULES).not.toBeUndefined();
    expect(Validation.RULES.PASSWORD).not.toBeUndefined();
    expect(Validation.RULES.EMAIL).not.toBeUndefined();
  });

  describe('isPasswordValid', () => {
    test('should exist', () => {
      expect(Validation.isPasswordValid).not.toBeUndefined();
    });

    test('should produce an object with an "ok" property', () => {
      expect(Validation.isPasswordValid('testing1234')).toHaveProperty('ok');
    });

    test('should produce an object with an "error" property', () => {
      expect(Validation.isPasswordValid('testing1234')).toHaveProperty('error');
    });

    test('should take in a string as an argument', () => {
      expect(Validation.isPasswordValid(1234)).toMatchObject({
        ok: false,
        error: 'The password should be a string, instead got a number',
      });
      expect(Validation.isPasswordValid('testing12345')).toMatchObject({
        ok: true,
      });
    });

    test('should check that the password has a number of min characters', () => {
      expect(Validation.isPasswordValid('')).toMatchObject({
        ok: false,
        error: `The password should be at least ${Validation.RULES.PASSWORD.MIN_LENGTH} characters long.`,
      });
      expect(Validation.isPasswordValid('asdf')).toMatchObject({
        ok: false,
        error: `The password should be at least ${Validation.RULES.PASSWORD.MIN_LENGTH} characters long.`,
      });
    });
  });

  describe('isEmailValid', () => {
    test('should exist', () => {
      expect(Validation.isEmailValid).not.toBeUndefined();
    });

    test('should return an object with an "ok" property', () => {
      expect(Validation.isEmailValid()).toHaveProperty('ok');
    });

    test('should return an object with an "error" property', () => {
      expect(Validation.isEmailValid()).toHaveProperty('error');
    });

    test('should return an "ok" property with a value of false if the passed email is not valid', () => {
      expect(Validation.isEmailValid()).toMatchObject({
        ok: false,
        error: `The given email is not valid: ${undefined}`,
      });
      expect(Validation.isEmailValid(1233)).toMatchObject({
        ok: false,
        error: `The given email is not valid: 1233`,
      });
      expect(Validation.isEmailValid('testing')).toMatchObject({
        ok: false,
        error: `The given email is not valid: testing`,
      });
      expect(Validation.isEmailValid('testing.com')).toMatchObject({
        ok: false,
        error: `The given email is not valid: testing.com`,
      });
      expect(Validation.isEmailValid('testing-testing.com')).toMatchObject({
        ok: false,
        error: `The given email is not valid: testing-testing.com`,
      });
    });

    test('should return an "ok" property with a value of true if the passed email is valid', () => {
      expect(Validation.isEmailValid('john@test.com')).toMatchObject({
        ok: true,
        error: null,
      });
      expect(Validation.isEmailValid('john@test.com.uy')).toMatchObject({
        ok: true,
        error: null,
      });
      expect(Validation.isEmailValid('john-123@test.com.uy')).toMatchObject({
        ok: true,
        error: null,
      });
    });
  });

  describe('_isValidAmount', () => {
    test('returns true for a valid number', () => {
      expect(Validation._isValidAmount(10)).toBe(true);
    });

    test('returns false for a non-number', () => {
      expect(Validation._isValidAmount('10')).toBe(false);
      expect(Validation._isValidAmount(true)).toBe(false);
      expect(Validation._isValidAmount(null)).toBe(false);
    });

    test('returns false for NaN', () => {
      expect(Validation._isValidAmount(NaN)).toBe(false);
    });
  });

  describe('_isValidDate', () => {
    test('returns true for a valid date', () => {
      expect(Validation._isValidDate(new Date())).toBe(true);
    });

    test('returns false for a non-date', () => {
      expect(Validation._isValidDate('2022-01-01')).toBe(false);
      expect(Validation._isValidDate(100)).toBe(false);
      expect(Validation._isValidDate(null)).toBe(false);
    });
  });

  describe('isValidTransaction', () => {
    test('returns ok: true for a valid transaction', () => {
      const transaction = {
        name: 'Test transaction',
        amount: 10,
        date: new Date(),
      };
      expect(Validation.isValidTransaction(transaction)).toEqual({
        ok: true,
        error: null,
      });
    });

    test('returns ok: false and an error message for an invalid transaction name', () => {
      const transaction = {
        name: '',
        amount: 10,
        date: new Date(),
      };
      expect(Validation.isValidTransaction(transaction)).toEqual({
        ok: false,
        error: "The transaction's name should be a valid non-empty string.",
      });
    });

    test('returns ok: false and an error message for an invalid transaction amount', () => {
      const transaction = {
        name: 'Test transaction',
        amount: '10',
        date: new Date(),
      };
      expect(Validation.isValidTransaction(transaction)).toEqual({
        ok: false,
        error: "The transaction's amount should be a valid number.",
      });
    });

    test('returns ok: false and an error message for an invalid transaction date', () => {
      const transaction = {
        name: 'Test transaction',
        amount: 10,
        date: '2022-01-01',
      };
      expect(Validation.isValidTransaction(transaction)).toEqual({
        ok: false,
        error: "The transaction's date should be a valid JavaScript date.",
      });
    });
  });
});
