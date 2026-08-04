import { Booking } from "../models/booking.model.js";
import { Campground } from "../models/campground.model.js";
import { AppError } from "../utils/appError.js";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export const createBooking = async (req, res) => {
  const { campgroundId } = req.params;
  const { checkIn, checkOut } = req.body;
  const userId = req.user._id;

  const campground = await Campground.findById(campgroundId);

  if (!campground) {
    throw new AppError("Campground not found", 404);
  }

  if (campground.author.equals(userId)) {
    throw new AppError("You cannot book your own campground", 400);
  }

  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);

  //jezeli startDate lub endDate beda undefined
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError("Invalid booking dates", 400);
  }

  if (startDate >= endDate) {
    throw new AppError("Check-out must be after check-in", 400);
  }

  //sprawdzamy czy nie ma kolidacji
  const conflictingBooking = await Booking.exists({
    campground: campgroundId,

    status: {
      $in: ["pending", "confirmed"],
    },

    checkIn: {
      $lt: endDate,
    },
    checkOut: {
      $gt: startDate,
    },
  });

  if (conflictingBooking) {
    throw new AppError("Selected dates are not available", 409);
  }

  const numberOfNights = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY,
  );

  const pricePerNight = campground.price;
  const totalPrice = pricePerNight * numberOfNights;

  const booking = await Booking.create({
    campground: campgroundId,
    user: userId,
    checkIn: startDate,
    checkOut: endDate,
    numberOfNights,
    pricePerNight,
    totalPrice,
    status: "pending",
    paymentStatus: "unpaid",
  });

  res.status(201).json({
    success: true,
    message: "Booking has been created successfully",
    data: booking,
  });
};

export const payForBooking = async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    user: req.user._id,
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status === "cancelled") {
    throw new AppError("Cancelled booking cannot be paid", 400);
  }

  if (booking.paymentStatus === "paid") {
    throw new AppError("Booking has already been paid", 400);
  }
  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  await booking.save();
  res.status(200).json({
    success: true,
    message: "Payment completed successfullt",
    data: booking,
  });
};

export const getBooking = async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    user: req.user._id,
  }).populate("campground", "title location images price");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
};

export const getCampgroundAvailability = async (req, res) => {
  const { campgroundId } = req.params;
  const bookings = await Booking.find({
    campground: campgroundId,
    status: {
      $in: ["pending", "confirmed"],
    },

    //pomijda stare rezerwacje, ktore sie juz zakonczyly
    checkOut: {
      $gte: new Date(),
    },
  })
    .select("checkIn checkOut")
    .sort({ checkIn: 1 });

  res.status(200).json({
    success: true,
    data: bookings,
  });
};
