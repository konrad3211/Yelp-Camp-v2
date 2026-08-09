import type { CreateCampgroundFormData } from "@/schemas/campground.schema";
import { api, publicApi } from "./axios";
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

export const createCampground = async (data: CreateCampgroundFormData) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("street", data.street);
  formData.append("description", data.description);
  formData.append("price", String(data.price));
  formData.append("houseNumber", data.houseNumber);
  formData.append("city", data.city);

  Array.from(data.images).forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/campgrounds", formData);
  return response.data;
};
