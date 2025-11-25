import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { useQuery } from "@tanstack/react-query";

const getAllUserScoreDescriptors = async () => {
  return fetchWrapper<UserScoreDescriptorType[]>({
    url: "user-score-descriptor",
  });
};

export default function useGetAllUserScoreDescriptors() {
  return useQuery({
    queryKey: ["userScoreDescriptors"],
    queryFn: getAllUserScoreDescriptors,
  });
}
