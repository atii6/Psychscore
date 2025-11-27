import CustomContentCard from "@/components/shared/CustomContentCard";
import { Button } from "@/components/ui/button";
import type { UploadFileType } from "@/utilitites/types/UploadFile";
import { FileText, Play } from "lucide-react";

export type UploadedFile = {
  name: string;
  url: string;
  size: number;
};

type Props = {
  uploadedFiles: UploadFileType[];
  removeFile: (id: number, name: string) => void;
  handleProcessFiles: () => Promise<void>;
  isProcessing: boolean;
  hasProcessedFiles: boolean;
};

function FileUploadingCard({
  uploadedFiles,
  removeFile,
  handleProcessFiles,
  isProcessing,
  hasProcessedFiles,
}: Props) {
  return (
    <CustomContentCard
      title={`Uploaded Files (${uploadedFiles.length})`}
      Icon={FileText}
      iconProps={{
        className: "w-6 h-6",
        style: { color: "var(--secondary-blue)" },
      }}
    >
      {uploadedFiles.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {file.original_name}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {(file.size! / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFile(file.id, file.filename)}
            className="text-red-600 hover:text-red-700"
            type="button"
          >
            Remove
          </Button>
        </div>
      ))}
      {!hasProcessedFiles && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleProcessFiles}
            disabled={isProcessing || uploadedFiles.length === 0}
            className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
            }}
            type="button"
          >
            <Play className="w-5 h-5 mr-2" />
            {isProcessing ? "Processing Files..." : "Process Files"}
          </Button>
        </div>
      )}
    </CustomContentCard>
  );
}

export default FileUploadingCard;
