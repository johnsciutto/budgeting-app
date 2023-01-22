const express = require('express');
const { userRouter, categoryRouter, transactionRouter } = require('./routes');

const router = express.Router();

router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
