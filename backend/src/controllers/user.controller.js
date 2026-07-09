import { file } from "zod";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllUsers = async (req, res) => {
  const userId = req.user._id;
  const users = await User.find({
    _id: { $ne: userId },
  }).select("-password");
  res.status(200).json(users);
};

export const getMe = (req, res) => {
  res.status(200).json(req.user);
};

export const updateUser = async (req, res) => {
  const { fullName, email } = req.body;
  req.user.set({
    fullName,
    email,
  });

  await req.user.save();

  res.status(200).json({
    message: "User has been updated successfully",
    user: req.user,
  });
};

export const updateUserPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  const user = await User.findById(userId);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      message: "Current password is incorrect",
    });
  }

  req.user.password = newPassword;
  await req.user.save();

  res.status(200).json({
    message: "Password has been updated successfully",
  });
};

export const updateUserAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Avatar is required",
    });
  }
  const user = req.user;
  const oldAvatar = user.imageFilename;
  const result = await uploadToCloudinary(req.file);
  user.imageUrl = result.secure_url;
  user.imageFilename = result.public_id;

  await user.save();

  if (oldAvatar) {
    await cloudinary.uploader.destroy(oldAvatar);
  }

  res.status(200).json({
    message: "Avatar has been updated successfully",
    user,
  });
};

export const deleteUser = async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndDelete(userId);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({
    message: "User has been deleted successfully",
  });
};
