import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteGeneratedReport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (reportId: number) => {
      return await fetchWrapper({
        url: `generated-report/${reportId}`,
        method: "DELETE",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generatedReports"] });
      toast.success("Report deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete report.");
    },
  });

  return mutation;
}
