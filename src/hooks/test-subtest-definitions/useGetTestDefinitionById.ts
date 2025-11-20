import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { useQuery } from "@tanstack/react-query";

const getTestDefinitionById = async (
  id: number
): Promise<TestDefinitionType> => {
  return await fetchWrapper({
    url: `test-subtest-definition/${id}`,
  });
};

export default function useGetTestDefinitionByID(id: number) {
  return useQuery({
    queryKey: ["testDefinitions", id],
    queryFn: () => getTestDefinitionById(id),
    enabled: !!id,
  });
}
