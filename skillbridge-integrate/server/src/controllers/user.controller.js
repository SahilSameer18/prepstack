import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatUserResponse } from "../utils/auth.utils.js";
import userCache from "../services/userCache.service.js";


// Get current user profile and candidate preparation stats
const getProfileController = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { providers: true },
  });

  if (!user) {
    throw new ApiError(404, "User profile not found");
  }

  // Calculate candidate prep analytics from interview reports
  const reports = await prisma.interviewReport.findMany({
    where: { userId: req.user.id },
    select: { matchScore: true },
  });

  const totalReports = reports.length;
  const validScores = reports.map((r) => r.matchScore).filter((s) => s !== null && s !== undefined);
  const averageScore = validScores.length > 0
    ? Math.round(validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length)
    : 0;
  const topScore = validScores.length > 0 ? Math.max(...validScores) : 0;

  const formattedUser = formatUserResponse(user);
  const statsData = {
    totalReports,
    averageScore,
    topScore,
  };

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user: formattedUser,
      stats: statsData,
    },
    user: formattedUser,
    stats: statsData,
  });
});

// Update profile details (username, email, avatar)
const updateProfileController = asyncHandler(async (req, res) => {
  const { username, email, avatar } = req.body;
  const userId = req.user.id;

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) {
    throw new ApiError(404, "User account not found");
  }

  // Check username uniqueness if changing username
  if (username && username !== currentUser.username) {
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      throw new ApiError(400, "Username is already taken");
    }
  }

  // Check email uniqueness if changing email
  if (email && email.toLowerCase() !== currentUser.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmail) {
      throw new ApiError(400, "Email is already taken");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(username ? { username } : {}),
      ...(email ? { email: email.toLowerCase() } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
    },
    include: { providers: true },
  });

  await userCache.invalidate(userId);

  const formattedUpdatedUser = formatUserResponse(updatedUser);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: { user: formattedUpdatedUser },
    user: formattedUpdatedUser,
  });
});

// Change password for credential accounts
const changePasswordController = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  if (!user.password) {
    throw new ApiError(
      400,
      "Accounts registered via Google OAuth do not have a password. Please sign in with Google."
    );
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: newHash },
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export {
  getProfileController,
  updateProfileController,
  changePasswordController,
};

