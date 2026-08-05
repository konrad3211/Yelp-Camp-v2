import type { Campground } from "./campground";

export type CreateBookingResponse = {
  success: string;
  message: string;
  data: Booking;
};

export type Booking = {
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

export type GetCampgroundAvailabilityResponse = {
  success: string;
  data: UnavailableBooking[];
};

export type GetBookingResponse = {
  success: string;
  data: Booking;
};

export type payForBookingResponse = {
  success: string;
  message: string;
  data: Booking;
};

export type UnavailableBooking = {
  _id: string;
  checkIn: string;
  checkOut: string;
};

export type userBooking = {
  isPastBooking: boolean;
  checkIn: string;
  checkOut: string;
};
