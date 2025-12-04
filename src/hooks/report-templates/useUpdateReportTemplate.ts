import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type MutationVariables = {
  templateData: ReportTemplateType;
  id?: number;
};

async function updateTemplate({
  templateData,
  id,
}: MutationVariables): Promise<ReportTemplateType> {
  return await fetchWrapper<ReportTemplateType>({
    method: "PATCH",
    url: `report-template/${id}`,
    body: templateData,
  });
}

export default function useUpdateReportTemplate() {
  const queryClient = useQueryClient();
  return useMutation<ReportTemplateType, Error, MutationVariables>({
    mutationFn: updateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["templates"],
      });
      toast.success("Template updated successfully.");
    },
  });
}
