import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationVariables {
  testDefData: Omit<TestDefinitionType, "id">;
}

async function addNewTestDefinition({
  testDefData,
}: MutationVariables): Promise<TestDefinitionType> {
  return await fetchWrapper({
    url: `test-subtest-definition`,
    method: "POST",
    body: testDefData,
  });
}

export default function useCreateTestDefinition() {
  const queryClient = useQueryClient();

  return useMutation<TestDefinitionType, Error, MutationVariables>({
    mutationFn: (testDefData) => addNewTestDefinition(testDefData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testDefinitions"] });
      toast.success("Test created successfully.");
    },
    onError: () => {
      toast.error("Failed to create Test.");
    },
  });
}
