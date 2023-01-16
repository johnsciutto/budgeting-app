const { describe, test, expect } = require('@jest/globals');
const { protectRoute } = require('./auth');

describe('protectRoute', () => {
  const req = { headers: {} };
  const res = {
    statusCode: null,
    message: null,
    headers: {},
    status: function (num) {
      this.statusCode = num;
      return this;
    },
    send: function (message) {
      this.message = message;
      return true;
    },
  };
  const next = () => true;

  test('should return an error if the Authorization header is missing', () => {
    protectRoute(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Authorization header is missing');
  });

  test('should return an error if the Bearer token is missing', () => {
    req.headers['authorization'] = 'somethingthatisnotvalid';
    protectRoute(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Bearer token is missing');
  });

  // TODO: This is next...
  test.todo(
    "should return an error if the decoded token doesn't have the necessary properties"
  );

  test.todo(
    'should return an error if the issue time is greater than the current time'
  );

  test.todo('should return an error if the token expired');

  afterEach(() => {
    res.statusCode = null;
    res.message = null;
    res.headers = {};

    req.headers = {};
  });
});
