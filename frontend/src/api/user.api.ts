import type {
  UpdatePasswordFormData,
  UpdateProfileFormData,
  UpdateUserImageFormData,
} from "@/schemas/user.schema";
import type { GetMeResponse } from "../types/user";
import { api } from "./axios";

export const getMe = async () => {
  const response = await api.get<GetMeResponse>("/users/me");

  return response.data;
};

export const updateProfile = async (data: UpdateProfileFormData) => {
  const response = await api.patch("/users/me", data);
  return response.data;
};

export const updatePassword = async (data: UpdatePasswordFormData) => {
  await api.patch("/users/me/password", data);
};

export const updateProfileImage = async (data: UpdateUserImageFormData) => {
  const formData = new FormData();
  formData.append("avatar", data.image[0]);
  const response = await api.patch("/users/me/avatar", formData);
  return response.data;
};
