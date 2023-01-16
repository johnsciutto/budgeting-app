const { describe, test, expect } = require('@jest/globals');

describe('protectRoute', () => {
  test.todo('should return an error if the Authorization header is missing');

  test.todo('should return an error if the Bearer token is missing');

  test.todo(
    "should return an error if the decoded token doesn't have the necessary properties"
  );

  test.todo(
    'should return an error if the issue time is greater than the current time'
  );

  test.todo('should return an error if the token expired');
});
