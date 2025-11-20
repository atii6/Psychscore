import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { useQuery } from "@tanstack/react-query";

const getTemplateById = async (id: number): Promise<ReportTemplateType> => {
  return await fetchWrapper({
    url: `report-template/${id}`,
  });
};

export default function useGetReportTemplateByID(id: number) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => getTemplateById(id),
    enabled: !!id,
  });
}
