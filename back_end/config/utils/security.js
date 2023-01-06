const bcrypt = require('bcrypt');

class Security {
  static SALT_ROUNDS = 10;

  static async hashPassword(pass) {
    if (typeof pass !== 'string') {
      throw new Error(
        `The password needs to be a string, instead got a ${typeof pass}`
      );
    }
    const hashedPass = await bcrypt.hash(pass, this.SALT_ROUNDS);
    return hashedPass;
  }

  static async isUserPassword(user, pass) {
    const result = await bcrypt.compare(pass, user.password);
    return result;
  }
}

module.exports = { Security };
