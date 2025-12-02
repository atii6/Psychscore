import { create } from "zustand";
import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { AppUserAttributes } from "@/utilitites/types/User";

interface MeResponse {
  user: AppUserAttributes;
}

type AuthState = {
  user: AppUserAttributes | null;
  isLoggedIn: boolean;
  loading: boolean;
  setUser: (user: AppUserAttributes) => void;
  logout: () => Promise<void>;
  initializeUser: () => Promise<void>;
};

const useUserStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: true,

  setUser: (user) => {
    set({ user, isLoggedIn: !!user });
  },

  logout: async () => {
    try {
      // Call backend to clear cookie
      await fetchWrapper({
        url: "auth/logout",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      set({ user: null, isLoggedIn: false });
    } catch (err) {
      console.error("Failed to logout", err);
      set({ user: null, isLoggedIn: false });
    }
  },

  initializeUser: async () => {
    set({ loading: true });
    try {
      // Try to get the user from the backend using cookie
      const response = await fetchWrapper<MeResponse>({
        url: "auth/me",
        method: "GET",
      });

      set({ user: response.user, isLoggedIn: true, loading: false });
    } catch (err) {
      console.error("Failed to initialize user", err);
      set({ user: null, isLoggedIn: false, loading: false });
    }
  },
}));

export default useUserStore;
