const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
  editUser,
  deleteUser,
} = require('../controllers/users');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/:userId', editUser);
router.delete('/:userId', deleteUser);

module.exports = router;
