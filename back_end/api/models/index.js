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

Transaction.findAllFiltered = async function (filter) {
  const result = await Transaction.findAndCountAll({
    where: filter,
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'userId', 'categoryId'],
    },
    include: [
      {
        model: Category,
        required: true,
        attributes: {
          exclude: ['id'],
        },
      },
    ],
  });

  result.rows.forEach(({ dataValues: transaction }) => {
    const type = transaction.Category.dataValues.type;
    const category = transaction.Category.dataValues.name;
    delete transaction.Category;
    transaction.type = type;
    transaction.category = category;
  });

  return { transactions: result.rows, transactionCount: result.count };
};

Transaction.findById = async function (id) {
  const { dataValues: transaction } = await Transaction.findByPk(id, {
    include: Category,
    attributes: { exclude: ['categoryId', 'createdAt', 'updatedAt', 'id'] },
  });

  transaction.type = transaction.Category.dataValues.type;
  transaction.category = transaction.Category.dataValues.name;
  delete transaction.Category;
  return transaction;
};

module.exports = { User, Category, Transaction };
