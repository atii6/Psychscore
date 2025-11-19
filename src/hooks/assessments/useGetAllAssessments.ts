import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import type { AssessmentType } from "@/utilitites/types/Assessment";
import { useQuery } from "@tanstack/react-query";

const getAllAssessments = async () => {
  return fetchWrapper<AssessmentType[]>({
    url: "assessment",
  });
};

export default function useGetAllAssessments() {
  return useQuery({
    queryKey: ["assessments"],
    queryFn: getAllAssessments,
  });
}
