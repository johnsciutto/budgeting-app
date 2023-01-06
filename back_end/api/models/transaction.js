const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  amount: {
    type: DataTypes.NUMERIC,
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
  },
});

module.exports = Transaction;
