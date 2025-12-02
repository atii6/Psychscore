import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useUserStore from "@/store/userStore";
import type { AppUserAttributes } from "@/utilitites/types/User";

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface RegisterResponse {
  token: string;
  user: AppUserAttributes;
}

async function registerRequest(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  return fetchWrapper<RegisterResponse>({
    url: `auth/register`,
    method: "POST",
    body: payload,
  });
}

export default function useRegister() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation<RegisterResponse, Error, RegisterPayload>({
    mutationFn: (payload) => registerRequest(payload),
    onSuccess: (res) => {
      setUser(res.user);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Account created for ${res.user.full_name}`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Registration failed");
    },
  });
}
