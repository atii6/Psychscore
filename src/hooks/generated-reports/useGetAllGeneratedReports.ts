import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { GeneratedReport } from "@/utilitites/types/GeneratedReports";
import { useQuery } from "@tanstack/react-query";

const getAllGeneratedReports = async () => {
  return fetchWrapper<GeneratedReport[]>({
    url: "generated-report",
  });
};

export default function useGetAllGeneratedReports() {
  return useQuery({
    queryKey: ["generatedReports"],
    queryFn: getAllGeneratedReports,
  });
}
