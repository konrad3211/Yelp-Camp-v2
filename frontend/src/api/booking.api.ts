import type {
  CreateBookingResponse,
  GetBookingResponse,
  GetCampgroundAvailabilityResponse,
  payForBookingResponse,
} from "@/types/booking";
import { api, publicApi } from "./axios";

type createBookingData = {
  checkIn: string;
  checkOut: string;
};

export const getCampgroundAvailability = async (campgroundId: string) => {
  const response = await publicApi.get<GetCampgroundAvailabilityResponse>(
    `/bookings/campgrounds/${campgroundId}/availability`,
  );
  return response.data;
};

export const createBooking = async (
  campgroundId: string,
  data: createBookingData,
) => {
  const response = await api.post<CreateBookingResponse>(
    `/bookings/campgrounds/${campgroundId}`,
    data,
  );
  return response.data;
};

export const getBooking = async (bookingId: string) => {
  const response = await api.get<GetBookingResponse>(`/bookings/${bookingId}`);
  return response.data;
};

export const payForBooking = async (bookingId: string) => {
  const response = await api.patch<payForBookingResponse>(
    `/bookings/${bookingId}/pay`,
  );
  return response.data;
};

export const getUserBooking = async (campgroundId: string) => {
  const response = await api.get(`/bookings/campgrounds/${campgroundId}`);
  return response.data;
};

export const getUserBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};

export const cancelUserBooking = async (bookingId: string) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`);
  return response.data;
};

export const cancelUserBookingByOwner = async (bookingId: string) => {
  const response = await api.patch(`/bookings/owner/${bookingId}/cancel`);
  return response.data;
};

type blockDatesByOwnerData = {
  startDate: string;
  endDate: string;
};

export const blockDatesByOwner = async (
  campgroundId: string,
  data: blockDatesByOwnerData,
) => {
  const response = await api.post(
    `/bookings/owner/campgrounds/${campgroundId}`,
    data,
  );
  return response.data;
};

export const getOwnerBlockedDates = async (campgroundId: string) => {
  const response = await api.get(`/bookings/owner/campgrounds/${campgroundId}`);
  return response.data;
};

export const unblockDatesByOwner = async (campgroundId: string) => {
  const response = await api.delete(
    `/bookings/owner/campgrounds/${campgroundId}`,
  );
  return response.data;
};

export const deleteOwnerBooking = async (bookingId: string) => {
  const response = await api.delete(`/bookings/owner/${bookingId}`);
  return response.data;
};

export const getCampgroundBookings = async (campgroundId: string) => {
  const response = await api.get(
    `/bookings/campgrounds/${campgroundId}/bookings`,
  );
  return response.data;
};

export const getBookingsStats = async () => {
  const response = await api.get(`/bookings/owner/stats`);
  return response.data;
};
