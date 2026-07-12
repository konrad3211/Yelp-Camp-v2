// to bedzie przechowywac zalogowanego użytkownika i access token.
import { create } from "zustand";
import type { User } from "../types/user";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,

  setUser: (user) => set({ user }),

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
