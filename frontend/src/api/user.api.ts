import type { GetMeResponse } from "../types/user";
import { api } from "./axios";

export const getMe = async () => {
  const response = await api.get<GetMeResponse>("/users/me");

  return response.data;
};
