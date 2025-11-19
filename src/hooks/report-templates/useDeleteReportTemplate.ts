import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (templateId: number) => {
      return await fetchWrapper({
        url: `report-template/${templateId}`,
        method: "DELETE",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete template.");
    },
  });

  return mutation;
}
