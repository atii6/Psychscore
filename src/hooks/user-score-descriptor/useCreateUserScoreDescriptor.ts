import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationVariables {
  descriptorData: Omit<UserScoreDescriptorType, "id">;
}

async function addNewScoreDescriptor({
  descriptorData,
}: MutationVariables): Promise<UserScoreDescriptorType> {
  return await fetchWrapper({
    url: `user-score-descriptor`,
    method: "POST",
    body: descriptorData,
  });
}

export default function useCreateScoreDescriptor() {
  const queryClient = useQueryClient();

  return useMutation<UserScoreDescriptorType, Error, MutationVariables>({
    mutationFn: (descriptorData) => addNewScoreDescriptor(descriptorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userScoreDescriptors"] });
      toast.success("Score descriptor created successfully.");
    },
    onError: () => {
      toast.error("Failed to create score descriptor.");
    },
  });
}
