const express = require('express');
const userRouter = express.Router();
const {
  loginUser,
  registerUser,
  editUser,
  deleteUser,
} = require('../controllers/users');

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.put('/:userId', editUser);
userRouter.delete('/:userId', deleteUser);

module.exports = { userRouter };
