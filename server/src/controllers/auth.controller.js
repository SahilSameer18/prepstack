const userModel = require('../models/auth.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');

// register user
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken. Please choose another." });
    }


    const hash = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      username,
      email,
      password: hash
    });

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // save refresh token to user in DB
    await userModel.findByIdAndUpdate(user._id, { refreshToken })

    // short-lived access token in cookie
    res.cookie('accessToken', accessToken, {  
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000           // 15 minutes
    })

    // long-lived refresh token in separate cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error)
  }
}

// login user

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // save refresh token to user in DB
    await userModel.findByIdAndUpdate(user._id, { refreshToken })

    // short-lived access token in cookie
    res.cookie('accessToken', accessToken, {  
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000           // 15 minutes
    })

    // long-lived refresh token in separate cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    })

    res.status(200).json({
      message: "user logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error)
  }
}


// logout user

const logoutUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id)
    if (user) {
      await userModel.findByIdAndUpdate(user._id, { refreshToken: null })
    }

    res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'none' })
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' })

    res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    next(error)
  }
}

// get current user

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error)
  }
}

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' })
    }

    // verify signature
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET)

    // check it matches what's stored in DB
    const user = await userModel.findById(decoded.id)
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' })
    }

    // rotate — issue new both tokens
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    await userModel.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken })

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ success: true, message: 'Token refreshed' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken
}
