import { useMutation, useQueryClient } from "@tanstack/react-query";

async function logoutRequest() {
  localStorage.removeItem("token");
  return true;
}

export default function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
