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
   */
  static isEmailValid(email) {
    const { EMAIL_REGEX } = this.RULES.EMAIL;
    const response = { ok: false, error: null };
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

  /**
   * Determines if the provided value is a valid amount.
   *
   * @param {number} amount - The value to be checked.
   * @returns {boolean} - True if the value is a valid amount, false otherwise.
   */
  static _isValidAmount(amount) {
    return typeof amount === 'number' && !isNaN(amount);
  }

  /**
   * Determines if the provided value is a valid date.
   *
   * @param {Date} date - The value to be checked.
   * @returns {boolean} - True if the value is a valid date, false otherwise.
   */
  static _isValidDate(date) {
    return date instanceof Date;
  }

  /**
   * Determines if the provided transaction object is valid.
   *
   * @param {Object} transaction - The transaction object to be validated.
   * @property {string} transaction.name - The name of the transaction.
   * @property {number} transaction.amount - The amount of the transaction.
   * @property {Date} transaction.date - The date of the transaction.
   * @returns {Object} response - An object with two properties:
   * @property {boolean} response.ok: a boolean indicating whether the transaction is valid
   * @property {string | null} response.error: an error message if the transaction is not valid, null otherwise
   */
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

  static isValidPartialTransaction(transaction) {
    const response = { ok: true, error: null };
    try {
      const { name, date, note, type, category, amount} = transaction;

      if (!name && !note && !type && !category && !amount) {
        throw new Error(
          'The transaction was not modified. No new properties were given'
        );
      }

      if (!type && category) {
        throw new Error(
          'In order to modify the category, both the category and type need to be provided'
        );
      }

      if (name && typeof name !== 'string') {
        throw new Error(
          `Expected the name to be a string. Received: ${typeof name}`
        );
      }

      if (note && typeof note !== 'string') {
        throw new Error(
          `Expected the note to be a string. Received: ${typeof note}`
        );
      }

      if (amount && typeof amount !== 'number') {
        throw new Error(
          `Expected the amount to be a number. Received: ${typeof amount}`
        );
      }

      if (category && typeof category !== 'string') {
        throw new Error(
          `Expected the category to be a string. Received: ${typeof category}`
        );
      }

      if (type && !['expense', 'income'].includes(type)) {
        throw new Error(
          `Expected the type to be either "income" or "expense". Received: ${type}`
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
