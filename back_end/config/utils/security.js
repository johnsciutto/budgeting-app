const bcrypt = require('bcrypt');

class Security {
  static SALT_ROUNDS = 10;

  static async hashPassword(pass) {
    const hashedPass = await bcrypt.hash(pass, this.SALT_ROUNDS);
    return hashedPass;
  }

  static async isUserPassword(user, pass) {
    const result = await bcrypt.compare(pass, user.password);
    return result;
  }
}

module.exports = { Security };
