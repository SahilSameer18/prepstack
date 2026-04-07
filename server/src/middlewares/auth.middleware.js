const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklist.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const isTokenBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isTokenBlacklisted) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    req.user._id = decodedToken.id; // normalize: JWT uses 'id', controllers use '_id'
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;