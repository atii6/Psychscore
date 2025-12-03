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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["testDefinitions", variables.id],
      });
      toast.success("Test updated successfully.");
    },
  });
}
