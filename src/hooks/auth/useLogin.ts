import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { AppUserAttributes } from "@/utilitites/types/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useUserStore from "@/store/userStore";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AppUserAttributes;
}

async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  return fetchWrapper<LoginResponse>({
    url: `auth/login`,
    method: "POST",
    body: payload,
  });
}

export default function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) => loginRequest(payload),
    onSuccess: (res) => {
      setUser(res.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Welcome back, ${res.user.full_name}!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Login failed");
    },
  });
}
