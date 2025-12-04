import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationVariables = {
  descriptorData: UserScoreDescriptorType;
  id?: number;
};

async function updateScoreDescriptor({
  descriptorData,
  id,
}: MutationVariables): Promise<UserScoreDescriptorType> {
  return await fetchWrapper<UserScoreDescriptorType>({
    method: "PATCH",
    url: `user-score-descriptor/${id}`,
    body: descriptorData,
  });
}

export default function useUpdateScoreDescriptor() {
  const queryClient = useQueryClient();
  return useMutation<UserScoreDescriptorType, Error, MutationVariables>({
    mutationFn: updateScoreDescriptor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userScoreDescriptors"],
      });
      toast.success("Score descriptor updated successfully.");
    },
  });
}
