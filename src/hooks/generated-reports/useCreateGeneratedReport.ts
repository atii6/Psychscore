import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { GeneratedReport } from "@/utilitites/types/GeneratedReports";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationVariables {
  reportData: Omit<GeneratedReport, "id">;
}

async function addNewReport({
  reportData,
}: MutationVariables): Promise<GeneratedReport> {
  return await fetchWrapper({
    url: `generated-report`,
    method: "POST",
    body: reportData,
  });
}

export default function useCreateGeneratedReport() {
  const queryClient = useQueryClient();

  return useMutation<GeneratedReport, Error, MutationVariables>({
    mutationFn: (reportData) => addNewReport(reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generatedReports"] });
      toast.success("Report created successfully.");
    },
    onError: () => {
      toast.error("Failed to create Report.");
    },
  });
}
