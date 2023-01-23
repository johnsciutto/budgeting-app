const jwt = require('jsonwebtoken');
const User = require('../../db/models/user');
const { Validation } = require('../../utils/validation');
const { Security } = require('../../utils/security');

/**
 * @description - This function is used to register a new user by creating a new
 *                User object in the database. It expects a JSON object in the
 *                request body with the properties 'username', 'email', and
 *                'password' of the new user.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.username - The new user's username
 * @param {string} req.body.email - The new user's email
 * @param {string} req.body.password - The new user's password
 * @param {Object} res - Express response object
 * @returns {Object} response - JSON object with the following properties:
 * @property {boolean} response.ok - Indicates the success or failure of the operation.
 * @property {string | undefined} response.error - A description of the error. Only
 *                                                 present if the operation failed.
 * @property {string | undefined} response.token - A JSON web token that can be used
 *                                                 for authentication. Only present if
 *                                                 the operation succeeded.
 */
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  const response = { ok: false };
  let status = 200;
  try {
    // check that the username doesn't exist
    const user = await User.findOne({ where: { username } });
    if (user) {
      status = 409;
      throw new Error(
        'That username is already taken, please choose another one.'
      );
    }

    const emailValidity = Validation.isEmailValid(email);
    if (!emailValidity.ok) {
      status = 400;
      throw new Error(emailValidity.error);
    }

    const passwordValidity = Validation.isPasswordValid(password);
    if (!passwordValidity.ok) {
      status = 400;
      throw new Error(passwordValidity.error);
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    response.ok = true;

    const token = jwt.sign({ userId: newUser.id }, process.env.TOKEN_SECRET);

    res.setHeader('Authorization', `Bearer ${token}`);

    response.token = token;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }

  return res.json(response);
};

/**
 * @description - This function is used to edit the current user's account
 *                information. It expects a JSON object in the request body
 *                with the properties 'username', 'email', 'oldPassword',
 *                and 'newPassword' of the user. It uses the 'userId' property
 *                from the request object to identify the user.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object | undefined} req.user - The user object
 * @param {number | undefined} req.user.id - The user's id
 * @param {Object} req.body - The request body
 * @param {string | undefined} req.body.username - The user's new username
 * @param {string | undefined} req.body.email - The user's new email
 * @param {string | undefined} req.body.oldPassword - The user's old password
 * @param {string | undefined} req.body.newPassword - The user's new password
 * @param {Object} res - Express response object
 * @returns {Object} response - JSON object with the following properties:
 * @property {boolean} response.ok - Indicates the success or failure of the operation,
 * @property {string | undefined} response.error - A description of the error. Only
 *                                                 present if the operation failed.
 */
const editUser = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const { username, email, oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    const changeObj = {};

    if (username) {
      // check that the new username is not being used.
      const user = await User.findOne({ where: { username } });
      if (user) {
        status = 409;
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
      status = 400;
      throw new Error('One of the passwords is missing.');
    }

    if (oldPassword && newPassword) {
      const isValidPassword = Validation.isPasswordValid(newPassword);
      if (!isValidPassword.ok) {
        status = 400;
        throw new Error(isValidPassword.error);
      }

      const user = await User.findByPk(userId);

      const passwordMatches = await Security.isUserPassword(user, oldPassword);

      if (!passwordMatches) {
        status = 403;
        throw new Error('The given (existing) password is not correct.');
      }

      changeObj.password = newPassword;
    }

    const [resultCount] = await User.update(changeObj, {
      where: { id: userId },
    });

    if (resultCount !== 1) {
      status = 400;
      throw new Error('The user data was not updated.');
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }

  return res.json(response);
};

/**
 * @description - This function logs in a user by validating the provided
 *                username and password. If the provided credentials are
 *                valid, it will generate a JWT token and return it in the
 *                response. If the provided credentials are invalid, it will
 *                throw an error with message 'Invalid username or password'
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - The request body
 * @param {string | undefined} req.body.username - The user's username
 * @param {string | undefined} req.body.password - The user's password
 * @param {Object} res - Express response object
 * @returns {Object} response - JSON object
 * @property {boolean} response.ok - Indicates the success or failure of the operation,
 * @property {string | undefined} response.error - A description of the error. Only
 *                                                 present if the operation failed.
 * @property {string | undefined} response.token - The user token. Only present if the
 *                                                 operation succeeded.
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const response = { ok: true };
  let status = 200;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      status = 401;
      throw new Error('Invalid username or password');
    }

    const isCorrectPassword = await Security.isUserPassword(user, password);
    if (!isCorrectPassword) {
      status = 401;
      throw new Error(`Invalid username or password`);
    }

    const token = Security.generateToken(user.id);

    res.setHeader('Authorization', `Bearer ${token}`);

    response.token = token;
  } catch (error) {
    response.ok = false;
    response.error = error.message;
    res.status(status);
  }

  return res.json(response);
};

/**
 * @description - This function deletes a user from the database.
 *
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object | undefined} req.user - The user object
 * @param {number | undefined} req.user.id - The user's id
 * @param {Object} res - Express response object
 * @returns {Object} response - JSON object
 * @property {boolean} response.ok - Indicates the success or failure of the operation,
 * @property {string | undefined} response.error - A description of the error. Only
 *                                                 present if the operation failed.
 */
const deleteUser = async (req, res) => {
  const response = { ok: true };
  const userId = req.user?.id;
  let status = 200;

  try {
    if (!userId) {
      status = 400;
      throw new Error(`The userId is incorrect: ${userId}`);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      status = 404;
      throw new Error(`No user was found with the given id: ${userId}`);
    }

    const result = await User.destroy({
      where: {
        id: userId,
      },
    });

    if (result === 0) {
      status = 400;
      throw new Error('The operation to delete the user failed.');
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }

  return res.json(response);
};

module.exports = { registerUser, loginUser, editUser, deleteUser };
