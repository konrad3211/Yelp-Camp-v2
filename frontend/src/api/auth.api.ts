import { authApi } from "./axios";
import { useAuthStore } from "../store/auth.store";
import type {
  LoginData,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
} from "../types/auth";

export const login = async (loginData: LoginData) => {
  const response = await authApi.post<LoginResponse>("/auth/login", loginData);

  const { accessToken, user } = response.data;

  const authStore = useAuthStore.getState();

  authStore.setAccessToken(accessToken);
  authStore.setUser(user);

  return response.data;
};

export const refreshAuth = async () => {
  const response = await authApi.post<RefreshResponse>("/auth/refresh");

  const { accessToken, user } = response.data;

  const authStore = useAuthStore.getState();

  authStore.setAccessToken(accessToken);
  authStore.setUser(user);

  return response.data;
};

export const logout = async () => {
  const response = await authApi.post<LogoutResponse>("/auth/logout");
  useAuthStore.getState().logout();
  return response.data;
};
