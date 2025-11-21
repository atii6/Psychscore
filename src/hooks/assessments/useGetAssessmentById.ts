import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { AssessmentType } from "@/utilitites/types/Assessment";
import { useQuery } from "@tanstack/react-query";

const getAssessmentById = async (id: number): Promise<AssessmentType> => {
  return await fetchWrapper({
    url: `assessment/${id}`,
  });
};

export default function useGetAssessmentByID(id: number) {
  return useQuery({
    queryKey: ["assessments", id],
    queryFn: () => getAssessmentById(id),
    enabled: !!id,
  });
}
