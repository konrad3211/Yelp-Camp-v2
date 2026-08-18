import { Router } from "express";

import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import catchAsync from "../lib/catchAsync.js";

import {
  cancelUserBooking,
  createBooking,
  getBooking,
  getCampgroundAvailability,
  getUserBooking,
  getUserBookings,
  payForBooking,
} from "../controllers/booking.controller.js";

import { createBookingSchema } from "../schemas/booking.schema.js";

const router = Router();
router.get("/", protect, catchAsync(getUserBookings));
router.get("/campgrounds/:campgroundId", protect, catchAsync(getUserBooking));

router.get(
  "/campgrounds/:campgroundId/availability",
  catchAsync(getCampgroundAvailability),
);

router.post(
  "/campgrounds/:campgroundId",
  protect,
  validate(createBookingSchema),
  catchAsync(createBooking),
);
router.get("/:bookingId", protect, catchAsync(getBooking));

router.patch("/:bookingId/pay", protect, catchAsync(payForBooking));

router.patch("/:bookingId/cancel", protect, catchAsync(cancelUserBooking));

export default router;
