import { Review } from "../models/review.model.js";

export const isReviewAuthor = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.author.equals(userId)) {
      return res.status(403).json({ message: "You are not the author" });
    }

    req.review = review;

    next();
  } catch (error) {
    next(error);
  }
};
