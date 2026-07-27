import { Campground } from "../models/campground.model.js";
import { Review } from "../models/review.model.js";
import { AppError } from "../utils/appError.js";

export const createReview = async (req, res) => {
  const data = req.body;
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    throw new AppError("Campground not found", 404);
  }

  const review = await Review.create({
    author: req.user._id,
    ...data,
  });

  await review.populate("author", "username fullName imageUrl");

  campground.reviews.push(review._id);

  await campground.save();

  res.status(201).json({
    success: true,
    message: "Review has been created successfully",
    data: review,
  });
};

export const updateReview = async (req, res) => {
  //to jest z validate
  const data = req.body;

  req.review.set(data);

  await req.review.save();

  res.status(200).json({
    success: true,
    message: "Review has been updated successfully",
    data: req.review,
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
    success: true,
    message: "Review has been deleted successfully",
  });
};

export const getReviews = async (req, res) => {
  const { campgroundId } = req.params;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const skip = (page - 1) * limit;

  const campground = await Campground.findById(campgroundId).select("_id");

  if (!campground) {
    throw new AppError("Campground not found", 404);
  }

  const filter = {
    campground: campgroundId,
  };

  const [reviews, totalReviews] = await Promise.all([
    Review.find(filter)
      .populate("author", "username fullName imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Review.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).json({
    success: true,
    message: "Reviews fetched successfully",
    data: {
      reviews,
      page,
      limit,
      totalReviews,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};
