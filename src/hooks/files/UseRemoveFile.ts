import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useRemoveFile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (fileId: number) => {
      return await fetchWrapper({
        url: `files/upload/${fileId}`,
        method: "DELETE",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedFiles"] });
      toast.success("File removed.");
    },
    onError: () => {
      toast.error("Failed to remove file.");
    },
  });

  return mutation;
}
