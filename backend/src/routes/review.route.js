import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import {
  createReview,
  deleteReview,
  updateReview,
} from "../controllers/review.controller.js";
import { isReviewAuthor } from "../middleware/isReviewAuthor.middleware.js";

const router = Router({ mergeParams: true });

router.post("/", protect, catchAsync(createReview));
router.patch("/:reviewId", protect, isReviewAuthor, catchAsync(updateReview));
router.delete("/:reviewId", protect, isReviewAuthor, catchAsync(deleteReview));

export default router;
