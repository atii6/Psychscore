import { fetchWrapper } from "@/utilitites/helpers/fetchWrapper";
import { UploadFileType } from "@/utilitites/types/UploadFile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadFileVariables {
  file: File;
}

// Function to upload a file
async function uploadFile({
  file,
}: UploadFileVariables): Promise<UploadFileType> {
  console.log("useUploadFile", file);
  const formData = new FormData();
  formData.append("file", file);

  return await fetchWrapper({
    url: "files/upload",
    method: "POST",
    body: formData,
  });
}

export default function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation<UploadFileType, Error, UploadFileVariables>({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploadedFiles"] });
      toast.success("File uploaded successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to upload file.");
    },
  });
}
