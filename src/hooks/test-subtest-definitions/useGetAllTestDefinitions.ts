import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { useQuery } from "@tanstack/react-query";

const getAllTestDefinitions = async () => {
  return fetchWrapper<TestDefinitionType[]>({
    url: "test-subtest-definition",
  });
};

export default function useGetAllTestDefinitions() {
  return useQuery({
    queryKey: ["testDefinitions"],
    queryFn: getAllTestDefinitions,
  });
}
