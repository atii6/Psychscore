import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import AttachmentCard, {
  type AttachmentCardType,
} from "@/components/shared/attachment-card";
import { GridItem } from "@/components/ui/Grid";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import ErrorText from "./error-text";

type TextareaFieldProps = {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  name?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  size?: GridItemProps["size"];
  className?: string;
  maxCharactersLength?: number;
  disableGutter?: boolean;
  showAttachmentButton?: boolean;
  attachments?: AttachmentCardType[];
  handleUploads?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAttachments?: (files: AttachmentCardType[]) => void;
  isUploadingFile?: boolean;
  onAttachmentRemove?: (index: number) => void;
  errorMessage?: string;
  showCharacterCount?: boolean;
};

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  name,
  required,
  rows = 4,
  placeholder,
  className,
  size = 12,
  maxCharactersLength = 1000,
  disableGutter = false,
  showAttachmentButton,
  attachments,
  handleUploads,
  isUploadingFile,
  onAttachmentRemove,
  errorMessage,
  showCharacterCount,
}) => {
  return (
    <GridItem className={className} size={size}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#262626]">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex flex-col gap-1">
        <Textarea
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          maxLength={maxCharactersLength}
          placeholder={placeholder}
          showAttachmentButton={showAttachmentButton}
          showCharacterCount={showCharacterCount}
        />

        {!disableGutter && (
          <div className="h-2">
            <ErrorText message={errorMessage || ""} />
          </div>
        )}

        {showAttachmentButton && (
          <>
            <Input
              id="file-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleUploads}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="absolute left-3 bottom-7 z-20 flex items-center gap-1.5 text-sm text-[#385C80] cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Photo/Video
            </label>
          </>
        )}
      </div>

      {attachments && attachments.length > 0 && (
        <div className="flex gap-4 mt-2">
          {attachments.map((file, index) => (
            <AttachmentCard
              key={index}
              title={file.title}
              details={file.details}
              fileTypeTag={file.fileTypeTag}
              file={file.file}
              isUploading={isUploadingFile || false}
              previewUrl={file.url}
              thumbnail={file.url}
              cardType="file"
              onClose={() => onAttachmentRemove?.(index)}
              isRemovable
              width={70}
              height={70}
            />
          ))}
        </div>
      )}
    </GridItem>
  );
};

export default TextareaField;
