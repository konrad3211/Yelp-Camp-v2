import type { User } from "./user";

export type LoginData = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
  user: User;
};

export type RefreshResponse = {
  success: boolean;
  accessToken: string;
  user: User;
};
