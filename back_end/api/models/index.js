const User = require('./user');
const Category = require('./category');
const Transaction = require('./transaction');

// A user can have many categories, and a category can be used by many users.
User.belongsToMany(Category, { through: 'user_category' });
Category.belongsToMany(User, { through: 'user_category' });

// A user has many transactions, but a transaction can have only one user.
User.hasMany(Transaction, {
  foreignKey: {
    name: 'userId',
    allowNull: false,
  },
});
Transaction.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: false,
  },
});

// A transaction can have only one category, but a category can be used in many transactions.
Transaction.belongsTo(Category, {
  foreignKey: {
    name: 'categoryId',
    allowNull: false,
  },
});
Category.hasMany(Transaction, {
  foreignKey: {
    name: 'categoryId',
    allowNull: false,
  },
});

module.exports = { User, Category, Transaction };
