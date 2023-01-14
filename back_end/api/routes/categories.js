const express = require('express');
const categoryRouter = express.Router();
const {
  getCategories,
  addCategory,
  deleteCategory,
} = require('../controllers/category');

categoryRouter.get('/:userId', getCategories);
categoryRouter.post('/:userId', addCategory);
categoryRouter.delete('/:userId', deleteCategory);

module.exports = { categoryRouter };
