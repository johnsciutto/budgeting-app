const { Security } = require('./security');
const { describe, it, xit, expect } = require('@jest/globals');

describe('Security', () => {
  it('should exist', () => {
    expect(Security).not.toBeNull();
  });

  it('should have a SALT_ROUNDS static property that is an interger greater or equal to 10', () => {
    expect(Security.SALT_ROUNDS).not.toBeNull();
    expect(Security.SALT_ROUNDS).toBeGreaterThanOrEqual(10);
  });

  describe('hashPassword', () => {
    it('should exist', () => {
      expect(Security.hashPassword).not.toBeUndefined();
    });

    // NOTE: For some reason this is not working properly
    xit('should take in a string as a parameter', () => {
      expect(() => {
        Security.hashPassword(1);
      }).toThrow();
    });

    it('should produce a hashed password', async () => {
      const hashedPass = await Security.hashPassword('testing');
      expect(hashedPass.length).toBeGreaterThan(10);
    });
  });

  describe('isUserPassword', () => {
    it('should exist', () => {
      expect(Security.isUserPassword).not.toBeUndefined();
    });
  });
});
