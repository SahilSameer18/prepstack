const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET)
    req.user = decodedToken;
    req.user._id = decodedToken.id; // normalize: JWT uses 'id', controllers use '_id'
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Access token expired — client should call /refresh
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      // Token was tampered with — do not refresh
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    next(error);
  }
}

module.exports = authMiddleware;


