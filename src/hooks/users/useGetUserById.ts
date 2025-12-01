import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AppUserAttributes } from "@/utilitites/types/User";
import { useQuery } from "@tanstack/react-query";

const getReportById = async (id: number): Promise<AppUserAttributes> => {
  return await fetchWrapper({
    url: `generated-report/${id}`,
  });
};

export default function useGetGenratedReportByID(id: number) {
  return useQuery({
    queryKey: ["generatedReports", id],
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
}
