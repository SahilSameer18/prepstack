const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errors: ['Unauthorized']
      });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET);
    req.user = decodedToken;
    req.user._id = decodedToken.id; // normalize: JWT uses 'id', controllers use '_id'
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Access token expired: client should call /refresh
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        errors: ['Token expired']
      });
    }
    if (error.name === 'JsonWebTokenError') {
      // Token was tampered with: do not refresh
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        errors: ['Invalid token']
      });
    }
    next(error);
  }
}

module.exports = authMiddleware;

