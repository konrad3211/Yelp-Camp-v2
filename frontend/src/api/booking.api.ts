import type {
  createBookingResponse,
  getBookingResponse,
  getCampgroundAvailabilityResponse,
  payForBookingResponse,
} from "@/types/booking";
import { api, publicApi } from "./axios";

type createBookingData = {
  checkIn: string;
  checkOut: string;
};

export const getCampgroundAvailability = async (campgroundId: string) => {
  const response = await publicApi.get<getCampgroundAvailabilityResponse>(
    `/campgrounds/${campgroundId}/availability`,
  );
  return response.data;
};

export const createBooking = async (
  campgroundId: string,
  data: createBookingData,
) => {
  const response = await api.post<createBookingResponse>(
    `/bookings/campgrounds/${campgroundId}`,
    data,
  );
  return response.data;
};

export const getBooking = async (bookingId: string) => {
  const response = await api.get<getBookingResponse>(`/bookings/${bookingId}`);
  return response.data;
};

export const payForBooking = async (bookingId: string) => {
  const response = await api.patch<payForBookingResponse>(
    `/bookings/${bookingId}/pay`,
  );
  return response.data;
};
