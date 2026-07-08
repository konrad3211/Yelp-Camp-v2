import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import {
  createReview,
  deleteReview,
  updateReview,
} from "../controllers/review.controller.js";
import { isReviewAuthor } from "../middleware/isReviewAuthor.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  protect,
  validate(createReviewSchema),
  catchAsync(createReview),
);
router.patch(
  "/:reviewId",
  protect,
  isReviewAuthor,
  validate(updateReviewSchema),
  catchAsync(updateReview),
);
router.delete("/:reviewId", protect, isReviewAuthor, catchAsync(deleteReview));

export default router;
