const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklist.model');

// register user

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (isUserAlreadyExist) {
      return res.status(400).json({ message: "User already exists" });
    }


    const hash = await bcrypt.hash(password, 12);

    const user = await userModel.create({
      username,
      email,
      password: hash
    });

    const token = jwt.sign({
      id: user._id,
      username: user.username
    },
      process.env.JWT_SECRET,
      { expiresIn: '1d' });
    res.cookie('token', token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
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
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign({
      id: user._id,
      username: user.username
    },
      process.env.JWT_SECRET,
      { expiresIn: '1d' });

    res.cookie('token', token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
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
    const token = req.cookies.token;

    if (token) {
      await blacklistTokenModel.create({ token });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser
}