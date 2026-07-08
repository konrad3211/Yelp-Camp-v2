import { Router } from "express";
import catchAsync from "../lib/catchAsync.js";
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), catchAsync(register));
router.post("/login", validate(loginSchema), catchAsync(login));
router.post("/logout", logout);
router.post("/refresh", catchAsync(refreshAccessToken));

router.get("/me", protect, catchAsync(getCurrentUser));

export default router;
