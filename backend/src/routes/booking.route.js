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
  blockCampgroundDates,
  getOwnerBlockedDates,
  cancelOwnerBooking,
  getCampgroundBookings,
  cancelUserBookingByOwner,
  countCampgroundBookings,
} from "../controllers/booking.controller.js";

import {
  createBookingSchema,
  createInactiveCampgroundDates,
} from "../schemas/booking.schema.js";

const router = Router();
router.get("/", protect, catchAsync(getUserBookings));
router.get(
  "/campgrounds/:campgroundId/bookings",
  protect,
  catchAsync(getCampgroundBookings),
);
router.get("/campgrounds/:campgroundId", protect, catchAsync(getUserBooking));

router.get(
  "/campgrounds/:campgroundId/availability",
  catchAsync(getCampgroundAvailability),
);

router.get(
  "/owner/campgrounds/:campgroundId",
  protect,
  catchAsync(getOwnerBlockedDates),
);

router.get("/owner/stats", protect, catchAsync(countCampgroundBookings));

router.post(
  "/campgrounds/:campgroundId",
  protect,
  validate(createBookingSchema),
  catchAsync(createBooking),
);

router.post(
  "/owner/campgrounds/:campgroundId",
  protect,
  validate(createInactiveCampgroundDates),
  catchAsync(blockCampgroundDates),
);

router.get("/:bookingId", protect, catchAsync(getBooking));

router.patch("/:bookingId/pay", protect, catchAsync(payForBooking));

router.patch("/:bookingId/cancel", protect, catchAsync(cancelUserBooking));

router.patch(
  "/owner/:bookingId/cancel",
  protect,
  catchAsync(cancelUserBookingByOwner),
);

router.delete("/owner/:bookingId", protect, catchAsync(cancelOwnerBooking));

export default router;
