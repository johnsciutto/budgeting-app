const { describe, test, expect } = require('@jest/globals');
const bcrypt = require('bcrypt');
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
});
