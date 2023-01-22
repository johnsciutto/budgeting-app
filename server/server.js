require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./api/index');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.use('/api', router);
