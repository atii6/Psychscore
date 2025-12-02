import { useMutation, useQueryClient } from "@tanstack/react-query";
import useUserStore from "@/store/userStore";
import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";

async function logoutRequest() {
  // Call backend logout endpoint to clear the cookie
  await fetchWrapper({
    url: "auth/logout",
    method: "POST",
  });

  return true;
}

export default function useLogout() {
  const queryClient = useQueryClient();
  const logout = useUserStore((state) => state.logout);

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}
