const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Validation } = require('../../config/utils/validation');
const { Security } = require('../../config/utils/security');

/**
 * Register a new user into the system.
 *
 * @async
 * @param {object} req - the request
 * @param {object} res - the response
 */
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const response = { ok: false, error: null };
  try {
    // check that the username doesn't exist
    const user = await User.findOne({ where: { username } });
    if (user) {
      throw new Error(
        'That username is already taken, please choose another one.'
      );
    }

    const emailValidity = Validation.isEmailValid(email);
    if (!emailValidity.ok) {
      throw new Error(emailValidity.error);
    }

    const passwordValidity = Validation.isPasswordValid(password);
    if (!passwordValidity.ok) {
      throw new Error(passwordValidity.error);
    }

    // hash the password.
    const hashedPassword = await Security.hashPassword(password);
    // Store the user with the username, the email and the hashedPassword in the database.
    if (!hashedPassword.ok) {
      throw new Error(hashedPassword.error);
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword.password,
    });

    response.ok = true;

    const token = jwt.sign({ userId: newUser.id }, process.env.TOKEN_SECRET, {
      algorithm: 'RS256',
    });

    res.setHeader('Authorization', `Bearer ${token}`);

    response.token = token;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  // return the response object with the correct data.
  return res.json(response);
};

/**
 * Edit a user.
 *
 * @async
 * @param {object} req
 * @param {object} res
 * @returns {object} response
 * @property {boolean} response.ok
 * @property {string | null} response.error
 */
const editUser = async (req, res) => {
  const response = { ok: true, error: null };
  try {
    const { username, email, oldPassword, newPassword } = req.body;
    const { userId } = req.params;

    const changeObj = {};

    if (username) {
      // check that the new username is not being used.
      const user = await User.findOne({ where: { username } });
      if (user) {
        throw new Error(`That username is already taken.`);
      }
      changeObj.username = username;
    }

    if (email) {
      // TODO: When adding an email service, add a confirmation
      //       email before completing this operation.
      changeObj.email = email;
    }

    if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
      throw new Error('One of the passwords is missing.');
    }

    if (oldPassword && newPassword) {
      const isValidPassword = Validation.isPasswordValid(newPassword);
      if (!isValidPassword.ok) {
        throw new Error(isValidPassword.error);
      }

      const user = await User.findByPk(userId);

      const passwordMatches = await Security.isUserPassword(user, oldPassword);

      if (!passwordMatches) {
        throw new Error('The given (existing) password is not correct.');
      }

      const hashedPassword = await Security.hashPassword(newPassword);

      if (!hashedPassword.ok) {
        throw new Error(hashedPassword.error);
      }

      changeObj.password = hashedPassword.password;
    }

    const [resultCount] = await User.update(changeObj, {
      where: { id: userId },
    });

    if (resultCount !== 1) {
      throw new Error('The user data was not updated.');
    }
    response.ok = true;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }

  return res.json(response);
};

/**
 * Log in a user
 *
 * @async
 * @returns {object} response
 * @property {boolean} response.ok
 * @property {string | null} response.error
 * @property {string | null} response.userId
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const response = { ok: true, error: null, userId: null };

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isCorrectPassword = await Security.isUserPassword(user, password);
    if (!isCorrectPassword) {
      throw new Error(`Invalid username or password`);
    }

    response.ok = true;
    response.userId = user.id;
  } catch (error) {
    response.ok = false;
    response.error = error.message;
  }

  return res.json(response);
};

/**
 * Delete a user from the application.
 *
 * @returns {object} response
 * @property {boolean} response.ok
 * @property {string | null} response.error
 */
const deleteUser = async (req, res) => {
  const response = { ok: true, error: null };
  const { userId } = req.params;

  try {
    if (!userId) {
      throw new Error(`The userId is incorrect: ${userId}`);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error(`No user was found with the given id: ${userId}`);
    }

    const result = await User.destroy({
      where: {
        id: userId,
      },
    });

    if (result === 0) {
      throw new Error('The operation to delete the user failed.');
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }

  return res.json(response);
};

module.exports = { registerUser, loginUser, editUser, deleteUser };
