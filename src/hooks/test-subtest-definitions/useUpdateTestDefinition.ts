import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationVariables = {
  testDefData: TestDefinitionType;
  id?: number;
};

async function updateTestDefinition({
  testDefData,
  id,
}: MutationVariables): Promise<TestDefinitionType> {
  return await fetchWrapper<TestDefinitionType>({
    method: "PATCH",
    url: `test-subtest-definition/${id}`,
    body: testDefData,
  });
}

export default function useUpdateTestDefinition() {
  const queryClient = useQueryClient();
  return useMutation<TestDefinitionType, Error, MutationVariables>({
    mutationFn: updateTestDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["testDefinitions"],
      });
      toast.success("Test updated successfully.");
    },
  });
}
