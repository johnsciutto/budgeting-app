require('dotenv').config();
const Sequelize = require('sequelize');
const path = require('path');

const createDbName = () => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV !== 'production') {
    return 'test_database.sqlite';
  } else {
    return 'database.sqlite';
  }
};

// TODO: Protect the db with a username and password for production
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `${path.resolve(__dirname)}/../${createDbName()}`,
  logging: false,
});

sequelize.authenticate();

module.exports = sequelize;
