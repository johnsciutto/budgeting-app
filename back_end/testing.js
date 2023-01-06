const {
  registerUser,
  loginUser,
  editUser,
} = require('./api/controllers/users');
const {
  addTransaction,
  getTransactions,
} = require('./api/controllers/transaction');

const testController = async (controller, req) => {
  try {
    const res = {
      json(obj) {
        return JSON.stringify(obj);
      },
    };

    const response = await controller(req, res);
    console.log({ response });
  } catch (err) {
    console.error(err);
  }
};

const REQ_OBJ = {
  USER: {
    REGISTER: {
      body: {
        username: 'johnsciutto',
        email: 'john@testing.com',
        password: 'abcd12345',
      },
    },
    LOGIN: {
      body: {
        username: 'johnsciutto',
        password: 'abcd12345',
      },
    },
    EDIT: {
      body: {
        username: 'cool-username',
        oldPassword: 'abcd12345',
        newPassword: 'abcd123456',
      },
      params: {
        userId: 1,
      },
    },
  },
  TRANSACTION: {
    ADD: {
      body: {
        date: new Date(),
        name: 'tesdting new transaction',
        amount: 13,
        type: 'income',
        category: 'Etsy',
      },
      params: {
        userId: 1,
      },
    },
    GET_MULTIPLE: {
      params: {
        userId: 1,
      },
    },
  },
};

const ROUTES = {
  USER: {
    REGISTER: 'POST /api/user/register',
    LOGIN: 'POST /api/user/login',
    EDIT: 'PUT /api/user/:userId',
  },
  TRANSACTION: {
    GET_ALL: 'GET /api/transaction/',
    GET: 'GET /api/transaction/:transactionId',
    ADD: 'POST /api/transaction/',
  },
};

const testRoute = (route) => {
  switch (route) {
    case ROUTES.USER.REGISTER:
      return testController(registerUser, REQ_OBJ.USER.REGISTER);
    case ROUTES.USER.LOGIN:
      return testController(loginUser, REQ_OBJ.USER.LOGIN);
    case ROUTES.USER.EDIT:
      return testController(editUser, REQ_OBJ.USER.EDIT);
    case ROUTES.TRANSACTION.GET:
      return testController(getTransactions, REQ_OBJ.TRANSACTION.GET_MULTIPLE);
    case ROUTES.TRANSACTION.ADD:
      return testController(addTransaction, REQ_OBJ.TRANSACTION.ADD);
    default:
      console.log(`--- No route with that name: ${route}`);
  }
};

testRoute(ROUTES.USER.LOGIN);
