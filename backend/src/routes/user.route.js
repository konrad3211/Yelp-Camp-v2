import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getMe,
  updateUser,
  updateUserAvatar,
  updateUserPassword,
} from "../controllers/user.controller.js";
import catchAsync from "../lib/catchAsync.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  updateUserPasswordSchema,
  updateUserSchema,
} from "../schemas/user.schema.js";

const router = Router();

router.get("/", protect, catchAsync(getAllUsers));
router.get("/me", protect, getMe);
router.patch(
  "/me",
  protect,
  validate(updateUserSchema),
  catchAsync(updateUser),
);
router.patch(
  "/me/password",
  protect,
  validate(updateUserPasswordSchema),
  catchAsync(updateUserPassword),
);
router.patch(
  "/me/avatar",
  protect,
  upload.single("avatar"),
  catchAsync(updateUserAvatar),
);
router.delete("/me", protect, catchAsync(deleteUser));
// router.get("/:id", catchAsync(getUser));

export default router;
