import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { useQuery } from "@tanstack/react-query";

const getAllReportTemplates = async () => {
  return fetchWrapper<ReportTemplateType[]>({
    url: "report-template",
  });
};

export default function useGetAllReportTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: getAllReportTemplates,
  });
}
