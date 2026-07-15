import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Not authorized, no token", 401);
    }

    //authHeader to bedzie np. "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...", wiec dzielimy go na 2 czesci i bierzemy te druga
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      // return res.status(401).json({ message: "User no loger exists" });
      throw new AppError("User no longer exists", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
