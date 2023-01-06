/**
 * @class Validator
 */
class Validation {
  static RULES = {
    PASSWORD: {
      MIN_LENGTH: 8,
    },
    EMAIL: {
      EMAIL_REGEX: new RegExp(
        "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
      ),
    },
  };

  /**
   * Given a string representing a password, produce a response object with an
   * "ok" property of "true" if the given string is a valid password. Else
   * give the return object an "ok" property of "false" and an "error" property
   * with the appropiate error message.
   *
   * @static
   * @method
   * @param {string} email - the email to check.
   * @returns {object} response
   * @property {boolean} response.ok
   * @property {string|null} response.error
   */
  static isPasswordValid(password) {
    const { MIN_LENGTH } = this.RULES.PASSWORD;
    const response = { ok: true, error: null };

    try {
      if (typeof password !== 'string') {
        throw new Error(
          `The password should be a string, instead got a ${typeof password}`
        );
      }
      if (password.length < MIN_LENGTH) {
        throw new Error(
          `The password should be at least ${MIN_LENGTH} characters long.`
        );
      }
      // TODO: Add other verifications for the password
    } catch (err) {
      response.ok = false;
      response.error = err.message;
    }

    return response;
  }

  /**
   * Given a string, validate if the string is a valid email.
   *
   * @static
   * @method
   * @param {string} email - the email to check.
   * @returns {object} response
   * @property {boolean} response.ok
   * @property {string | undefined} response.error
   * TODO: Test
   */
  static isEmailValid(email) {
    const { EMAIL_REGEX } = this.RULES.EMAIL;
    const response = { ok: false };
    try {
      const result = EMAIL_REGEX.test(email);
      if (!result) {
        throw new Error(`The given email is not valid: ${email}`);
      }
      response.ok = true;
    } catch (err) {
      response.ok = false;
      response.error = err.message;
    }
    return response;
  }

  // TODO: Document
  static _isValidAmount(amount) {
    return amount && typeof amount === 'number' && !isNaN(amount);
  }

  // TODO: Document
  static _isValidDate(date) {
    return date && date instanceof Date;
  }

  // TODO: Document
  static isValidTransaction(transaction) {
    const response = { ok: true, error: null };
    try {
      if (
        !transaction.name ||
        typeof transaction.name !== 'string' ||
        transaction.name.length === 0
      ) {
        throw new Error(
          `The transaction's name should be a valid non-empty string.`
        );
      }

      if (!this._isValidAmount(transaction.amount)) {
        throw new Error(`The transaction's amount should be a valid number.`);
      }

      if (!transaction.date || !this._isValidDate(transaction.date)) {
        throw new Error(
          `The transaction's date should be a valid JavaScript date.`
        );
      }
    } catch (err) {
      response.ok = false;
      response.error = err.message;
    }

    return response;
  }
}

module.exports = { Validation };
