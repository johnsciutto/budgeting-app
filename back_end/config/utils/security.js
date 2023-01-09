const bcrypt = require('bcrypt');

class Security {
  static SALT_ROUNDS = 10;

  static async hashPassword(pass) {
    const result = { ok: true };
    try {
      if (typeof pass !== 'string') {
        throw new Error(
          `The password needs to be a string, instead got a ${typeof pass}`
        );
      }

      result.hashedPass = await bcrypt.hash(pass, this.SALT_ROUNDS);
    } catch (err) {
      result.ok = false;
      result.error = err.message;
    }
    return result;
  }

  static async isUserPassword(user, pass) {
    const result = await bcrypt.compare(pass, user.password);
    return result;
  }
}

module.exports = { Security };
