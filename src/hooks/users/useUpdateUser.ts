import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AppUserAttributes } from "@/utilitites/types/User";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationVariables = {
  userData: AppUserAttributes;
  id?: number;
};

async function updateUser({
  userData,
  id,
}: MutationVariables): Promise<AppUserAttributes> {
  return await fetchWrapper<AppUserAttributes>({
    method: "PATCH",
    url: `user/${id}`,
    body: userData,
  });
}

export default function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation<AppUserAttributes, Error, MutationVariables>({
    mutationFn: updateUser,
  });
}
