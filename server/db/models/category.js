const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['income', 'expense']],
          msg: "The value must be either 'income' or 'expense'.",
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Category;
