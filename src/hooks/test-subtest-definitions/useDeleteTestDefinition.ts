import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteTestDefinition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (testDefId: number) => {
      return await fetchWrapper({
        url: `test-subtest-definition/${testDefId}`,
        method: "DELETE",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testDefinitions"] });
      toast.success("Test deleted successfully.");
    },
    onError: () => {
      toast.error("Failed to delete test definition.");
    },
  });

  return mutation;
}
