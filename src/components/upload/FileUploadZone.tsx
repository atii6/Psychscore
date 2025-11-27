import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ImageIcon, Camera, Loader2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

type FileUploadZoneProps = {
  onFileSelect: (files: FileList | File[]) => void;
  isUploading: boolean;
};

export default function FileUploadZone({
  onFileSelect,
  isUploading,
}: FileUploadZoneProps) {
  const { watch } = useFormContext();
  const client_first_name = watch("client_first_name");
  const client_last_name = watch("client_last_name");

  const disabled = !client_first_name.trim() || !client_last_name.trim();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
    }
  };

  return (
    <Card
      className="border-0 shadow-lg rounded-2xl"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2 text-xl"
          style={{ color: "var(--text-primary)" }}
        >
          <Upload
            className="w-6 h-6"
            style={{ color: "var(--secondary-blue)" }}
          />
          Upload Assessment Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
          multiple // Allow multiple file selection
        />

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            disabled
              ? "border-gray-200 bg-gray-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2
                className="w-12 h-12 animate-spin"
                style={{ color: "var(--secondary-blue)" }}
              />
              <p
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Uploading file(s)...
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center gap-4 mb-6">
                <FileText
                  className="w-12 h-12"
                  style={{ color: "var(--secondary-blue)" }}
                />
                <ImageIcon
                  className="w-12 h-12"
                  style={{ color: "var(--secondary-blue)" }}
                />
                <Camera
                  className="w-12 h-12"
                  style={{ color: "var(--secondary-blue)" }}
                />
              </div>

              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Upload Score Files
              </h3>
              <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                Drag & drop your assessment files or click to browse
              </p>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
                type="button"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Files
              </Button>

              <p
                className="text-sm mt-4"
                style={{ color: "var(--text-secondary)" }}
              >
                Supported: PDF, PNG, JPEG, CSV, Excel
              </p>

              {disabled && (
                <p className="text-sm text-red-500 mt-2">
                  Please enter client name first
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
