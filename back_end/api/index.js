const express = require('express');
const { userRouter } = require('./routes');

const router = express.Router();

router.use('/user', userRouter);

module.exports = router;
