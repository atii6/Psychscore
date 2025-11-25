import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { useQuery } from "@tanstack/react-query";

const getScoreDescriptorById = async (
  id: number
): Promise<UserScoreDescriptorType> => {
  return await fetchWrapper({
    url: `user-score-descriptor/${id}`,
  });
};

export default function useGetUserScoreDescriptorByID(id: number) {
  return useQuery({
    queryKey: ["userScoreDescriptors", id],
    queryFn: () => getScoreDescriptorById(id),
    enabled: !!id,
  });
}
