import { Booking } from "../models/booking.model.js";
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

  const userBooking = await Booking.findOne({
    campground: campground._id,
    user: req.user._id,
    status: "confirmed",
    paymentStatus: "paid",
    checkOut: {
      $lt: new Date(),
    },
  });

  if (!userBooking) {
    throw new AppError(
      "You can only review a campground after completing a booking",
      403,
    );
  }

  const exisitngReview = await Review.exists({
    _id: { $in: campground.reviews },
    author: req.user._id,
  });

  if (exisitngReview) {
    throw new AppError("You already have a review in this campground", 409);
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
  const { id: campgroundId } = req.params;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const skip = (page - 1) * limit;

  const campground = await Campground.findById(campgroundId).select("reviews");

  if (!campground) {
    throw new AppError("Campground not found", 404);
  }
  //campground zapisuje tylko id reviews
  const reviewIds = campground.reviews;

  //tutaj mamy destrukturyzacje. Czyli pierwszy warunek zostanie przypisany do reviews a drugi do totalReviews.
  const [reviews, totalReviews] = await Promise.all([
    Review.find({
      _id: {
        $in: reviewIds,
      },
    })
      .populate("author", "username fullName imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Review.countDocuments({
      _id: {
        $in: reviewIds,
      },
    }),
  ]);

  //zaokragla do gory
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
