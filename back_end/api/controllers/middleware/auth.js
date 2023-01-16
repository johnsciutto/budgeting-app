const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error('Authorization header is missing');
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Bearer token is missing');
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    if (decoded.iss !== 'BudgetingApp') {
      throw new Error('Token is invalid');
    }

    if (!decoded.sub || !decoded.iat || !decoded.exp) {
      throw new Error('Token is invalid');
    }

    if (decoded.iat > Date.now()) {
      throw new Error('Token is invalid');
    }

    if (decoded.exp < Date.now()) {
      throw new Error('Token has expired');
    }

    req.user = { id: decoded.sub };
    next();
  } catch (error) {
    let message = error.message;
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.NotBeforeError
    ) {
      message = 'Invalid token';
    }
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token has expired';
    }
    return res.status(401).send(message);
  }
};

module.exports = { protectRoute };
