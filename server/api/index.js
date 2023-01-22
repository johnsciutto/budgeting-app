const express = require('express');
const bodyParser = require('body-parser')
const { userRouter, categoryRouter, transactionRouter } = require('./routes');

const router = express.Router();

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.use('/user', userRouter);
router.use('/category', categoryRouter);
router.use('/transaction', transactionRouter);

module.exports = router;
