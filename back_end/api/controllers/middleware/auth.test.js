const { describe, test, expect } = require('@jest/globals');
const jwt = require('jsonwebtoken');
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

  test("should return an error if the decoded token doesn't have the iss", () => {
    req.headers['authorization'] = 'Bearer sometokenvaluehere';

    jest
      .spyOn(jwt, 'verify')
      .mockReturnValueOnce({ iat: 1123123, exp: 1234234234, sub: 1 });

    protectRoute(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Token is invalid');
  });

  test("should return an error if the decoded token doesn't have the sub", () => {
    req.headers['authorization'] = 'Bearer sometokenvaluehere';

    jest
      .spyOn(jwt, 'verify')
      .mockReturnValueOnce({ iat: 1123123, exp: 1234234234 });

    protectRoute(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Token is invalid');
  });

  test("should return an error if the decoded token doesn't have the iat", () => {
    req.headers['authorization'] = 'Bearer sometokenvaluehere';

    jest
      .spyOn(jwt, 'verify')
      .mockReturnValueOnce({ sub: 1123123, exp: 1234234234 });

    protectRoute(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Token is invalid');
  });

  test("should return an error if the decoded token doesn't have the exp", () => {
    req.headers['authorization'] = 'Bearer sometokenvaluehere';

    jest
      .spyOn(jwt, 'verify')
      .mockReturnValueOnce({ sub: 1123123, iat: 1234234234 });

    protectRoute(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Token is invalid');
  });

  test('should return an error if the issue time is greater than the current time', () => {
    req.headers['authorization'] = 'Bearer sometokenvaluehere';

    jest.spyOn(jwt, 'verify').mockReturnValueOnce({
      iss: 'BudgetingApp',
      sub: 1123123,
      iat: Math.floor(Date.now() / 1000) + 1000,
      exp: Math.floor(Date.now() / 1000) + 3000,
    });

    protectRoute(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Token has expired');
  });

  test('should return an error if the token expired', () => {
    req.headers['authorization'] = 'Bearer sometokenvaluehere';

    jest.spyOn(jwt, 'verify').mockReturnValueOnce({
      iss: 'BudgetingApp',
      sub: 1123123,
      iat: Math.floor(Date.now() / 1000) - 1000,
      exp: Math.floor(Date.now() / 1000) - 1,
    });

    protectRoute(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.message).toBe('Token has expired');
  });

  afterEach(() => {
    res.statusCode = null;
    res.message = null;
    res.headers = {};

    req.headers = {};

    jest.restoreAllMocks();
  });
});
