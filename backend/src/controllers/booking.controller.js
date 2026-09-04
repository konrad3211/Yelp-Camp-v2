import { Booking } from "../models/booking.model.js";
import { Campground } from "../models/campground.model.js";
import { AppError } from "../utils/appError.js";
import { fromZonedTime } from "date-fns-tz";

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

  const timeZone = "Europe/Warsaw";

  const startDate = fromZonedTime(`${checkIn}T15:00:00`, timeZone);

  const endDate = fromZonedTime(`${checkOut}T12:00:00`, timeZone);

  console.log(startDate.toString(), endDate.toString());

  // sprawdzamy, czy daty są prawidłowe
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

export const blockCampgroundDates = async (req, res) => {
  const { campgroundId } = req.params;
  const { startDate, endDate } = req.body;
  const userId = req.user._id;

  const campground = await Campground.findOne({
    _id: campgroundId,
    author: userId,
  });

  if (!campground) {
    throw new AppError("Campground not found", 404);
  }

  const timeZone = "Europe/Warsaw";

  const start = fromZonedTime(`${startDate}T15:00:00`, timeZone);

  const end = fromZonedTime(`${endDate}T12:00:00`, timeZone);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError("Invalid dates", 409);
  }

  if (start >= end) {
    throw new AppError("Start date must be earlier than end date", 400);
  }

  const isAlreadyBooked = await Booking.exists({
    campground: campgroundId,
    status: {
      $in: ["pending", "confirmed"],
    },
    checkIn: {
      $lt: end,
    },
    checkOut: {
      $gt: start,
    },
  });

  if (isAlreadyBooked) {
    throw new AppError("Selected dates are already booked", 400);
  }

  const booking = await Booking.create({
    campground: campgroundId,
    user: userId,
    checkIn: start,
    checkOut: end,
    numberOfNights: 0,
    pricePerNight: 0,
    totalPrice: 0,
    type: "owner_block",
    status: "confirmed",
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

export const getUserBooking = async (req, res) => {
  const userId = req.user._id;
  const { campgroundId } = req.params;

  const userBooking = await Booking.findOne({
    user: userId,
    campground: campgroundId,
    status: "confirmed",
  }).sort({ createdAt: -1 });

  if (!userBooking) {
    return res.status(200).json({
      success: true,
      data: userBooking,
    });
  }

  const data = {
    isPastBooking: userBooking.checkOut < new Date(),
    checkOut: userBooking.checkOut,
    checkIn: userBooking.checkIn,
  };

  res.status(200).json({
    success: true,
    data,
  });
};

export const getUserBookings = async (req, res) => {
  const userId = req.user._id;

  const userBookings = await Booking.find({
    user: userId,
    type: "booking",
  })
    .populate({
      path: "campground",
      populate: {
        path: "author",
        select: "username fullName imageUrl",
      },
    })
    .sort({
      checkIn: 1,
    });

  res.status(200).json({
    success: true,
    data: userBookings,
  });
};

export const getCampgroundBookings = async (req, res) => {
  const userId = req.user._id;
  const { campgroundId } = req.params;

  const campground = await Campground.findOne({
    author: userId,
    _id: campgroundId,
  });

  if (!campground) {
    throw new AppError("Booking not found", 404);
  }

  const bookings = await Booking.find({
    campground: campground._id,
    type: "booking",
    status: {
      $in: ["confirmed", "pending"],
    },
  }).populate("user");

  res.status(200).json({
    success: true,
    data: bookings,
  });
};

export const getCampgoundBookingsBlockedByOwner = async (req, res) => {
  const { campgroundId } = req.params;
  const userId = req.user._id;

  const campgroundBookings = await Booking.find({
    campground: campgroundId,
    type: "owner_block",
    user: userId,
  });

  res.status(200).json({
    success: true,
    data: campgroundBookings,
  });
};

export const cancelUserBooking = async (req, res) => {
  const userId = req.user._id;
  const { bookingId } = req.params;

  const booking = await Booking.findOne({
    _id: bookingId,
    user: userId,
  });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  booking.status = "cancelled";

  await booking.populate({
    path: "campground",
    populate: {
      path: "author",
      select: "username fullName imageUrl",
    },
  });

  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
  });
};

export const cancelUserBookingByOwner = async (req, res) => {
  const userId = req.user._id;
  const { bookingId } = req.params;

  const booking = await Booking.findOne({
    _id: bookingId,
  }).populate({
    path: "campground",
    populate: {
      path: "author",
      select: "_id",
    },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (!booking.campground.author._id.equals(userId)) {
    throw new AppError("You are not the owner", 403);
  }

  booking.set({
    status: "cancelled",
  });

  await booking.save();

  res.status(200).json({
    success: true,
    message: "Booking has been cancelled successfully",
    data: booking,
  });
};

export const cancelOwnerBooking = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user._id;

  const booking = await Booking.findOneAndDelete({
    _id: bookingId,
    user: userId,
    type: "owner_block",
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Booking deleted successfully",
  });
};

export const countCampgroundBookings = async (req, res) => {
  const userId = req.user._id;

  const campground = await Campground.find({
    author: userId,
  }).select("_id");

  const campgroundIds = campground.map((campground) => campground._id);

  const count = await Booking.aggregate([
    {
      $match: {
        campground: {
          $in: campgroundIds,
        },
        type: "booking",
        status: {
          $in: ["confirmed"],
        },
      },
    },
    {
      $group: {
        _id: "$campground",
        revenue: {
          $sum: "$totalPrice",
        },
        bookingsCount: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: count,
  });
};
