const userModel = require('../models/auth.model')
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

    const token = jwt.sign({
      id: user._id,
      username: user.username
    },
      process.env.JWT_SECRET,
      { expiresIn: '1d' });


    res.cookie('token', token,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
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
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
        secure: true,
        sameSite: 'none',
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
      secure: true,
      sameSite: 'none'
    });
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

// update user

// const updateUser = async (req, res, next) => {
//   try {
//     const { username, email } = req.body;
//     const user = await userModel.findByIdAndUpdate(req.user.id, { username, email }, { new: true });
//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     next(error)
//   }
// }

// update password

// const updatePassword = async (req, res, next) => {
//   try {
//     const { password } = req.body;
//     const user = await userModel.findByIdAndUpdate(req.user.id, { password }, { new: true });
//     res.status(200).json({
//       success: true,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     next(error)
//   }
// }


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
}