const express = require('express');
const userRouter = require('./routes/users');

const router = express.Router();

router.use('/user', userRouter);

module.exports = router;
