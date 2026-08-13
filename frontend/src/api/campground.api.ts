import type {
  CreateCampgroundFormData,
  UpdateCampgroundFormData,
  UpdateImagesFormData,
} from "@/schemas/campground.schema";
import { api, publicApi } from "./axios";
import type {
  GetCampgroundResponse,
  GetCampgroundsResponse,
} from "@/types/campground";

type GetCampgroundParams = {
  location?: string;
  checkIn?: string;
  checkOut?: string;
};

export const getCampgrounds = async (params?: GetCampgroundParams) => {
  const response = await publicApi.get<GetCampgroundsResponse>("/campgrounds", {
    params,
  });

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

export const updateCampground = async (
  campgroundId: string,
  data: UpdateCampgroundFormData,
) => {
  const response = await api.patch(`/campgrounds/${campgroundId}`, data);
  return response.data;
};

export const deleteCampgroundImage = async (
  campgroundId: string,
  imageId: string,
) => {
  const response = await api.delete(
    `/campgrounds/${campgroundId}/images/${imageId}`,
  );
  return response.data;
};

export const updateCampgroundImages = async (
  id: string,
  data: UpdateImagesFormData,
) => {
  const formData = new FormData();

  Array.from(data.images).forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.patch(`/campgrounds/${id}/images`, formData);
  return response.data;
};
