import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AuthUser, LoginResponse, RegisterPayload } from "./useLogin";

async function registerRequest(payload: RegisterPayload): Promise<AuthUser> {
  const res = await fetchWrapper<LoginResponse>({
    url: `auth/register`,
    method: "POST",
    body: payload,
  });

  if (res?.token) {
    localStorage.setItem("token", res.token);
  }

  return res.user;
}

export default function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, RegisterPayload>({
    mutationFn: (payload) => registerRequest(payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success(`Account created for ${user.full_name}`);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Registration failed");
    },
  });
}
