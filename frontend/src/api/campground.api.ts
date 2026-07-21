import { publicApi } from "./axios";
import type {
  GetCampgroundResponse,
  GetCampgroundsResponse,
} from "@/types/campground";

export const getCampgrounds = async () => {
  const response = await publicApi.get<GetCampgroundsResponse>("/campgrounds");

  return response.data;
};

export const getCampground = async (campgroundId: string) => {
  const response = await publicApi.get<GetCampgroundResponse>(
    `/campgrounds/${campgroundId}`,
  );

  return response.data;
};
