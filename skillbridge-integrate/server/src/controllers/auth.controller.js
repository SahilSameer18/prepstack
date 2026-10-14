import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatUserResponse, verifyGoogleToken } from "../utils/auth.utils.js";
import blacklistService from "../services/blacklist.service.js";
import userCache from "../services/userCache.service.js";

// Utility helper to attach HTTP-only session cookie
const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// Register user with username, email, and password
const registerUserController = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const isUserAlreadyExist = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username }],
    },
  });

  if (isUserAlreadyExist) {
    throw new ApiError(400, "Username or email already exists");
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email: email.toLowerCase(),
      password: hash,
    },
    include: { providers: true },
  });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  setAuthCookie(res, token);

  const formattedUser = formatUserResponse(user);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user: formattedUser },
    user: formattedUser,
  });
});

// Login user with email and password
const loginUserController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { providers: true },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Prevent password login on password-less OAuth accounts
  if (!user.password) {
    throw new ApiError(
      401,
      "This account uses Google Sign-In. Please continue with Google."
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  setAuthCookie(res, token);

  const formattedUser = formatUserResponse(user);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: formattedUser },
    user: formattedUser,
  });
});

// Authenticate or register user via Google OAuth access token
const googleAuthController = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  // Verify access token via Google userinfo endpoint and extract user info
  const { sub, email, name, picture } = await verifyGoogleToken(accessToken);
  const normalizedEmail = email.toLowerCase();

  // Check if Google provider is already linked to an account
  const existingProvider = await prisma.oAuthProvider.findUnique({
    where: {
      providerName_providerId: { providerName: "google", providerId: sub },
    },
    include: {
      user: { include: { providers: true } },
    },
  });

  // Returning Google user login
  if (existingProvider) {
    let user = existingProvider.user;

    // Always sync avatar from Google — handles new pic, updated pic, and removed pic (null)
    const freshAvatar = picture || null;
    if (user.avatar !== freshAvatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: freshAvatar },
        include: { providers: true },
      });
      await userCache.invalidate(user.id);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    setAuthCookie(res, token);

    const formattedUser = formatUserResponse(user);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: { user: formattedUser },
      user: formattedUser,
    });
  }

  // Account conflict: Email exists without Google link
  const existingUserWithEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUserWithEmail) {
    throw new ApiError(
      409,
      "An account with this email already exists. Please log in with your password to link Google."
    );
  }

  // Generate clean username from name with fallback for non-Latin characters
  let baseUsername = name.toLowerCase().replace(/[^a-z0-9_]/g, "").trim();
  if (baseUsername.length < 3) {
    baseUsername = `user_${Math.random().toString(36).substring(2, 8)}`;
  } else if (baseUsername.length > 15) {
    baseUsername = baseUsername.substring(0, 15);
  }

  let createdUser = null;
  let attempt = 0;
  let targetUsername = baseUsername;

  // Retry logic for unique username collisions
  while (!createdUser && attempt < 3) {
    try {
      createdUser = await prisma.user.create({
        data: {
          username: targetUsername,
          email: normalizedEmail,
          password: null,
          avatar: picture,
          providers: {
            create: { providerName: "google", providerId: sub },
          },
        },
        include: { providers: true },
      });
    } catch (err) {
      if (err.code === "P2002") {
        if (Array.isArray(err.meta?.target) && err.meta.target.includes("email")) {
          throw new ApiError(409, "An account with this email already exists.");
        }
        attempt++;
        targetUsername = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
      } else {
        throw err;
      }
    }
  }

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user account. Please try again.");
  }

  const token = jwt.sign(
    { id: createdUser.id, username: createdUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  setAuthCookie(res, token);

  const formattedCreatedUser = formatUserResponse(createdUser);

  return res.status(201).json({
    success: true,
    message: "User registered with Google successfully",
    data: { user: formattedCreatedUser },
    user: formattedCreatedUser,
  });
});

// Link Google account to currently authenticated user account
const linkGoogleController = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  const { sub, email, picture } = await verifyGoogleToken(accessToken);

  const currentUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { providers: true },
  });

  if (!currentUser) {
    throw new ApiError(404, "User account not found");
  }

  // Security check: Google email must match logged-in account email
  if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
    throw new ApiError(
      403,
      "Google account email does not match your current SkillBridge AI account email."
    );
  }

  const existingProvider = await prisma.oAuthProvider.findUnique({
    where: {
      providerName_providerId: { providerName: "google", providerId: sub },
    },
  });

  if (existingProvider) {
    if (existingProvider.userId === currentUser.id) {
      const formattedCurrent = formatUserResponse(currentUser);
      return res.status(200).json({
        success: true,
        message: "Google account is already linked",
        data: { user: formattedCurrent },
        user: formattedCurrent,
      });
    }
    throw new ApiError(409, "This Google account is already linked to another user.");
  }

  await prisma.oAuthProvider.create({
    data: {
      providerName: "google",
      providerId: sub,
      userId: currentUser.id,
    },
  });

  const updatedUser = await prisma.user.update({
    where: { id: currentUser.id },
    data: { avatar: picture || currentUser.avatar },
    include: { providers: true },
  });

  await userCache.invalidate(currentUser.id);

  const formattedUpdated = formatUserResponse(updatedUser);

  res.status(200).json({
    success: true,
    message: "Google account linked successfully",
    data: { user: formattedUpdated },
    user: formattedUpdated,
  });
});

// Clear authentication cookie and blacklist session token
const logoutUserController = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.exp) {
      await blacklistService.blacklist(token, decoded.exp);
    }
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// Get current logged-in user profile details
const getMeController = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { providers: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const formattedMe = formatUserResponse(user);

  res.status(200).json({
    success: true,
    message: "User details retrieved successfully",
    data: { user: formattedMe },
    user: formattedMe,
  });
});

export {
  registerUserController,
  loginUserController,
  googleAuthController,
  linkGoogleController,
  logoutUserController,
  getMeController,
};
