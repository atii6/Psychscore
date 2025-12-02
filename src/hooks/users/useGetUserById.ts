import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AppUserAttributes } from "@/utilitites/types/User";
import { useQuery } from "@tanstack/react-query";

const getReportById = async (id: number): Promise<AppUserAttributes> => {
  return await fetchWrapper({
    url: `user/${id}`,
  });
};

export default function useGetUserByID(id: number) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
}
