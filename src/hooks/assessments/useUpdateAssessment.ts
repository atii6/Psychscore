import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AssessmentType } from "@/utilitites/types/Assessment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationVariables = {
  assessmentData: AssessmentType;
  id?: number;
};

async function updateAssessment({
  assessmentData,
  id,
}: MutationVariables): Promise<AssessmentType> {
  return await fetchWrapper<AssessmentType>({
    method: "PATCH",
    url: `assessment/${id}`,
    body: assessmentData,
  });
}

export default function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation<AssessmentType, Error, MutationVariables>({
    mutationFn: updateAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assessments"],
      });
      toast.success("Assessment updated successfully.");
    },
  });
}
