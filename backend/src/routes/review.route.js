import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import catchAsync from "../lib/catchAsync.js";
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../controllers/review.controller.js";
import { isReviewAuthor } from "../middleware/isReviewAuthor.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../schemas/review.schema.js";

//dzieki temu mozemy przeczytac url
const router = Router({ mergeParams: true });

router.get("/", catchAsync(getReviews));

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
