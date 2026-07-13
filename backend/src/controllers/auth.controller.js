import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
};

const sendRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    //cookie nie mozna odczytac js w przegladarce
    httpOnly: true,
    //cookie jest wysalne przez https w production
    secure: process.env.NODE_ENV === "production",
    //cookie musi byc wyslane przez ta sama domene
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  const { fullName, email, password, username } = req.body;
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new AppError("Email or username already exists", 409);
  }
  const user = new User({
    username,
    fullName,
    email,
    password,
  });

  await user.save();

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  sendRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    accessToken,
    user: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  sendRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    },
  });
};

export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError("No refresh token", 401);
  }

  //to jest zrobione po to zeby przeslac error do globalnego error handlera, bez tego error by zwrocil jwt
  let decoded;
  //sprawdzamy czy token jest prawidlowy, jak jest to zwraca nam id usera
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  //szukamy tego usera po id, jak znajdzie to zwraca go bez hasla
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  const accessToken = signAccessToken(user._id);

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      imageUrl: user.imageUrl,
    },
  });
};

//pozniej we froncie bedziemy tego uzywac przy odwiezeniu strony, aby front wiedzial kim jest zalogowany user
export const getCurrentUser = async (req, res) => {
  res.status(200).json(req.user);
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
