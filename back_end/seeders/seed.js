const sequelize = require('../config/db');
const { User, Transaction, Category } = require('../api/models/index');

const SEED_PASS = 'pass12345';

const users = [
  {
    username: 'john',
    email: 'john@example.com',
    password: SEED_PASS,
  },
  {
    username: 'david',
    email: 'david@example.com',
    password: SEED_PASS,
  },
  {
    username: 'susan',
    email: 'susan@example.com',
    password: SEED_PASS,
  },
];

const categories = [
  {
    type: 'income',
    name: 'Paycheck',
  },
  {
    type: 'income',
    name: 'Etsy Sale',
  },
  {
    type: 'income',
    name: 'Refund',
  },
  {
    type: 'expense',
    name: 'Groceries',
  },
  {
    type: 'expense',
    name: 'Takeout',
  },
  {
    type: 'expense',
    name: 'Entertainment',
  },
  {
    type: 'expense',
    name: 'Home',
  },
  {
    type: 'expense',
    name: 'Debt Repayment',
  },
  {
    type: 'expense',
    name: 'Health',
  },
  {
    type: 'expense',
    name: 'Education',
  },
];

const transactions = [
  {
    name: 'Salary',
    date: new Date(),
    categoryId: 1,
    amount: 2000,
    userId: 1,
  },
  {
    name: 'Rent',
    date: new Date(),
    categoryId: 2,
    amount: 1000,
    userId: 1,
  },
  {
    name: 'Freelance work',
    date: new Date(),
    categoryId: 3,
    amount: 500,
    userId: 2,
  },
  {
    name: 'Grocery shopping',
    date: new Date(),
    categoryId: 4,
    amount: 100,
    userId: 2,
  },
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    const storedUsers = await User.bulkCreate(users);
    const storedCategories = await Category.bulkCreate(categories);
    await Transaction.bulkCreate(transactions);

    for (const user of storedUsers) {
      for (const cat of storedCategories) {
        await user.addCategory(cat);
      }
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    console.log('closing db connection');
    await sequelize.close();
    console.log('db connection closed');
  }
};

if (module === require.main) {
  seedDatabase();
}
