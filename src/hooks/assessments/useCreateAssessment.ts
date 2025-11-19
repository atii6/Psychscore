import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AssessmentType } from "@/utilitites/types/Assessment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationVariables {
  assessment: Omit<AssessmentType, "id">;
}

async function addNewAssessment({
  assessment,
}: MutationVariables): Promise<AssessmentType> {
  return await fetchWrapper({
    url: `assessment`,
    method: "POST",
    body: assessment,
  });
}

export default function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation<AssessmentType, Error, MutationVariables>({
    mutationFn: (assessment) => addNewAssessment(assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      toast.success("Assessment created successfully.");
    },
    onError: () => {
      toast.error("Failed to create assessment.");
    },
  });
}
