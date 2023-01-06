require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./api/index');

const { testRoute, ROUTES } = require('./testing');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.use('/api', router);

testRoute(ROUTES.USER.LOGIN);
