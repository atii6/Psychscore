import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

async function loginRequest(payload: LoginPayload): Promise<AuthUser> {
  const res = await fetchWrapper<LoginResponse>({
    url: `auth/login`,
    method: "POST",
    body: payload,
  });

  if (res?.token) {
    localStorage.setItem("token", res.token);
  }

  return res.user;
}

export default function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, LoginPayload>({
    mutationFn: (payload) => loginRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Welcome back!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Login failed");
    },
  });
}
