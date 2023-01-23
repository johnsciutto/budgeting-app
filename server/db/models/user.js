const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');
const { Security } = require('../../utils/security');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    paranoid: true,
    hooks: {
      beforeCreate: async (user) => {
        const pass = await Security.hashPassword(user.password);
        if (!pass.ok) {
          throw new Error(pass.error);
        }
        user.password = pass.password;
      },
      beforeBulkCreate: async (users) => {
        for (const user of users) {
          const pass = await Security.hashPassword(user.password);
          if (!pass.ok) {
            throw new Error(pass.error);
          }
          user.password = pass.password;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const pass = await Security.hashPassword(user.password);
          if (!pass.ok) {
            throw new Error(pass.error);
          }
          user.password = pass.password;
        }
      },
    },
  }
);

module.exports = User;
