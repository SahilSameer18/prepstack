const jwt = require('jsonwebtoken')

// short live
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.ACCESS_SECRET,
    { expiresIn: '15m' }
  )
}


//long live
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

