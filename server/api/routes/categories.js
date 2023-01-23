const express = require('express');
const { protectRoute } = require('../middleware/auth');
const {
  getCategories,
  addCategory,
  deleteCategory,
} = require('../controllers/category');

const categoryRouter = express.Router();

categoryRouter.use(protectRoute);

categoryRouter.get('/', getCategories);
categoryRouter.post('/', addCategory);
categoryRouter.delete('/', deleteCategory);

module.exports = { categoryRouter };
