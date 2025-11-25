import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteScoreDescriptor() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (descriptorId: number) => {
      return await fetchWrapper({
        url: `user-score-descriptor/${descriptorId}`,
        method: "DELETE",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userScoreDescriptors"] });
      toast.success("Score descriptor deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete score descriptor.");
    },
  });

  return mutation;
}
