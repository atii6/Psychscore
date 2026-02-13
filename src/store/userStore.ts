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
  initialized: boolean;
  setUser: (user: AppUserAttributes | null) => void;
  logout: () => Promise<void>;
  initializeUser: () => Promise<void>;
};

const useUserStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  loading: false,
  initialized: false,

  setUser: (user) => {
    set({
      user,
      isLoggedIn: !!user,
      initialized: true,
    });
  },

  logout: async () => {
    try {
      localStorage.removeItem("token");

      set({
        user: null,
        isLoggedIn: false,
        initialized: true,
      });
    } catch (err) {
      console.error("Failed to logout", err);
      set({
        user: null,
        isLoggedIn: false,
        initialized: true,
      });
    }
  },

  initializeUser: async () => {
    if (get().loading || get().initialized) return;

    set({ loading: true });

    try {
      const response = await fetchWrapper<MeResponse>({
        url: "auth/me",
        method: "GET",
      });

      set({
        user: response.user,
        isLoggedIn: true,
        loading: false,
        initialized: true,
      });
    } catch (err: any) {
      if (err?.status !== 401) {
        console.error("Failed to initialize user", err);
      }

      set({
        user: null,
        isLoggedIn: false,
        loading: false,
        initialized: true,
      });
    }
  },
}));

export default useUserStore;
