import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MutationVariables {
  template: Omit<ReportTemplateType, "id">;
}

async function addNewTemplate({
  template,
}: MutationVariables): Promise<ReportTemplateType> {
  return await fetchWrapper({
    url: `report-template`,
    method: "POST",
    body: template,
  });
}

export default function useCreateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation<ReportTemplateType, Error, MutationVariables>({
    mutationFn: (template) => addNewTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created successfully.");
    },
    onError: () => {
      toast.error("Failed to create template.");
    },
  });
}
