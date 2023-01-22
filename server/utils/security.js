const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

      result.password = await bcrypt.hash(pass, this.SALT_ROUNDS);
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

  static generateToken(userId, daysToExpire = 1) {
    try {
      if (!userId) {
        throw new Error();
      }

      const payload = {
        iss: 'BudgetingApp',
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + daysToExpire * 24 * 60 * 60,
      };

      const token = jwt.sign(payload, process.env.TOKEN_SECRET);
      return token;
    } catch (error) {
      throw new Error(`Error generating JWT token: ${error}`);
    }
  }
}

module.exports = { Security };
