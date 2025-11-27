export type FileStatusType = "uploaded" | "processing" | "done" | "failed";

export type UploadFileType = {
  id: number;
  original_name: string;
  filename: string;
  mime_type?: string;
  size?: number;
  path?: string;
  url?: string;
  status: FileStatusType;
  extracted_json?: string[];
  raw_text?: string;
};
