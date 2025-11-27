import type { ScoresType } from "@/pages/ManualEntry";
import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface ExtractionTestType {
  test_name: string;
  scores: ScoresType[];
}

export type ExtractedFileResponseType = {
  status: string;
  output: {
    tests: ExtractionTestType[];
    raw_llm_outputs: string[];
  };
};

interface ExtractFileVariables {
  uploadId: number;
}

const extractFile = async ({
  uploadId,
}: ExtractFileVariables): Promise<ExtractedFileResponseType> => {
  return await fetchWrapper({
    url: `files/extract/${uploadId}`,
    method: "GET",
  });
};

export default function useExtractFile() {
  const queryClient = useQueryClient();

  return useMutation<ExtractedFileResponseType, Error, ExtractFileVariables>({
    mutationFn: extractFile,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["extractedFiles", variables.uploadId],
      });
    },
    onError: (err: any) => {
      console.error("Failed to extract file:", err);
    },
  });
}
