import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AppUserAttributes } from "@/utilitites/types/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationVariables {
  user: Omit<AppUserAttributes, "id">;
}

async function addNewUser({
  user,
}: MutationVariables): Promise<AppUserAttributes> {
  return await fetchWrapper({
    url: `user`,
    method: "POST",
    body: user,
  });
}

export default function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<AppUserAttributes, Error, MutationVariables>({
    mutationFn: (user) => addNewUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully.");
    },
    onError: () => {
      toast.error("Failed to create user.");
    },
  });
}
