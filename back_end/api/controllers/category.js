const { Category, User } = require('../models/index');
const { Validation } = require('../../config/utils/validation');
const { DataPreparation } = require('../../config/utils/dataPreparation');

const getCategories = async (req, res) => {
  const response = { ok: true, error: null, categories: null };
  try {
    const { userId } = req.params;

    if (!userId || typeof userId === 'string') {
      throw new Error(`The given user id was not found: ${userId}`);
    }

    const user = await User.findByPk(userId)

    if (!user) {
      throw new Error('The given user was not found in the database.')
    }

    const categories = await User.getAllCategories(user);

    response.categories = categories;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const addCategory = async (req, res) => {
  const response = { ok: true, error: null, categories: null };
  try {
    // TODO: Write function
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

const deleteCategory = async (req, res) => {
  const response = { ok: true, error: null };
  try {
    // TODO: Write function
  } catch (err) {
    response.ok = false;
    response.error = err.message;
  }
  return res.json(response);
};

module.exports = { getCategories, addCategory, deleteCategory };
