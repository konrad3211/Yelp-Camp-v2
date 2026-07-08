import { Campground } from "../models/campground.model.js";
import { Review } from "../models/review.model.js";

export const createReview = async (req, res) => {
  const { text, rating } = req.body;
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    return res.status(404).json({ message: "Campground not found" });
  }

  const review = await Review.create({
    author: req.user._id,
    text,
    rating,
  });

  campground.reviews.push(review._id);

  await campground.save();

  res
    .status(201)
    .json({ message: "Review has been created successfully", review });
};

export const updateReview = async (req, res) => {
  const { text, rating } = req.body;

  req.review.set({
    text,
    rating,
  });

  await req.review.save();

  res.status(200).json({
    message: "Review has been updated successfully",
    review: req.review,
  });
};

export const deleteReview = async (req, res) => {
  const { id: campId, reviewId } = req.params;

  await Campground.findByIdAndUpdate(campId, {
    $pull: {
      reviews: reviewId,
    },
  });

  await req.review.deleteOne();

  res.status(200).json({
    message: "Review has been deleted successfully",
  });
};
