const { Category, User } = require('../../db/models');

const getCategories = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const userId = req.user?.id;

    if (!userId || typeof userId === 'string') {
      status = 404;
      throw new Error(`The given user id was not found: ${userId}`);
    }

    const user = await User.findById(userId);

    if (!user) {
      status = 404;
      throw new Error('The given user was not found in the database.');
    }

    const categories = await User.getAllCategories(user);

    response.categories = categories;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }
  return res.json(response);
};

const addCategory = async (req, res) => {
  const response = { ok: true };
  let status = 200;
  try {
    const userId = req.user?.id;
    const { type, category } = req.body;

    if (!userId || typeof userId === 'string') {
      status = 404;
      throw new Error(`The given user id was not found: ${userId}`);
    }

    const user = await User.findById(userId);

    if (!user) {
      status = 404;
      throw new Error('The given user was not found in the database.');
    }

    const result = await User.addCategory(user, { type, name: category });

    if (!result.ok) {
      status = 400;
      throw new Error(`The category was not added successfully.`);
    }

    response.categories = result.categories;
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }
  return res.json(response);
};

const deleteCategory = async (req, res) => {
  const response = { ok: true };
  let status = 200;

  const userId = req.user?.id;
  const { type, category } = req.body;

  try {
    if (!userId || typeof userId !== 'number') {
      status = 404;
      throw new Error(`The given user id was not found: ${userId}`);
    }

    // get the user
    const user = await User.findById(userId);

    if (!user) {
      status = 404;
      throw new Error(`The given user was not found in the database.`);
    }

    const storedCategory = await Category.findOne({
      where: {
        type: type,
        name: category,
      },
    });

    if (!storedCategory) {
      status = 404;
      throw new Error('The given category was not found in the database.');
    }

    const result = await user.removeCategory(storedCategory);

    if (result !== 1) {
      status = 400;
      throw new Error(
        `The ${type} with a name of ${category} was not deleted for the user with the id of ${userId}.`
      );
    }
  } catch (err) {
    response.ok = false;
    response.error = err.message;
    res.status(status);
  }
  return res.json(response);
};

module.exports = { getCategories, addCategory, deleteCategory };
