const express = require('express');
const { protectRoute } = require('../middleware/auth');
const {
  loginUser,
  registerUser,
  editUser,
  deleteUser,
} = require('../controllers/users');

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.put('/', protectRoute, editUser);
userRouter.delete('/', protectRoute, deleteUser);

module.exports = { userRouter };
