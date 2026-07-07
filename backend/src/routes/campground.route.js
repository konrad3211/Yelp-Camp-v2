import { Router } from "express";
import {
  createCampground,
  deleteCampground,
  getCampground,
  getCampgrounds,
  updateCampground,
} from "../controllers/campground.controller.js";
import catchAsync from "../lib/catchAsync.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAuthor } from "../middleware/isAuthor.middleware.js";

const router = Router();

router.get("/", catchAsync(getCampgrounds));
router.get("/:id", catchAsync(getCampground));
router.post("/", protect, catchAsync(createCampground));
router.patch("/:id", protect, isAuthor, catchAsync(updateCampground));
router.delete("/:id", protect, isAuthor, catchAsync(deleteCampground));

export default router;
