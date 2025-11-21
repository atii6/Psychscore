import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteAssessment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (assessmentId: number) => {
      return await fetchWrapper({
        url: `assessment/${assessmentId}`,
        method: "DELETE",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete assessment.");
    },
  });

  return mutation;
}
