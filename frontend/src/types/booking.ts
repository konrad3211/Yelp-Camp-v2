import type { Campground } from "./campground";

export type createBookingResponse = {
  success: string;
  message: string;
  data: booking;
};

export type booking = {
  _id: string;
  campground: Campground;
  user: string;
  checkIn: string;
  checkOut: string;
  numberOfNights: number;
  pricePerNight: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "failed" | "refunded";
};

export type getCampgroundAvailabilityResponse = {
  success: string;
  data: UnavailableBooking[];
};

export type getBookingResponse = {
  success: string;
  data: booking;
};

export type payForBookingResponse = {
  success: string;
  message: string;
  data: booking;
};

export type UnavailableBooking = {
  _id: string;
  checkIn: string;
  checkOut: string;
};
