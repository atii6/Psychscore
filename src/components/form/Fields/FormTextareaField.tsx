import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import ErrorText from "./ErrorText";
import { GridItem } from "@/components/ui/Grid";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import { Textarea } from "@/components/ui/textarea";
import AttachmentCard, {
  type AttachmentCardType,
} from "@/components/shared/attachment-card";
import ImageUploadField from "@/components/fields/image-upload-field";
import { cn } from "@/lib/utils";

type FormTextareaFieldProps = {
  name: string;
  label: string;
  size?: GridItemProps["size"];
  required?: boolean;
  rows?: number;
  cols?: number;
  disableGutter?: boolean;
  onAttachmentClick?: (url: string) => void;
  showCharacterCount?: boolean;
  placeholder?: string;
  className?: string;
  showAttachmentButton?: boolean;
  maxCharactersLength?: number;
  attachments?: AttachmentCardType[];
  handleUploads?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setAttachments?: (files: AttachmentCardType[]) => void;
  isUploadingFile?: boolean;
  onAttachmentRemove?: (index: number) => void;
  disabled?: boolean;
  readonly?: boolean;
  disableAttchmentButton?: boolean;
};

const FormTextareaField: React.FC<FormTextareaFieldProps> = ({
  name,
  label,
  required,
  size = 12,
  rows = 4,
  disableGutter = false,
  className,
  maxCharactersLength = 1000,
  attachments,
  setAttachments,
  handleUploads,
  isUploadingFile,
  onAttachmentRemove,
  onAttachmentClick,
  readonly = false,
  disableAttchmentButton = false,
  ...rest
}) => {
  const [charCount, setCharCount] = React.useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      setCharCount(textareaRef.current.value.length);
    }
  }, [charCount]);

  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  const { showAttachmentButton, showCharacterCount } = rest;

  return (
    <GridItem className={className} size={size}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#262626]">
          {label}
          {required && <span className="text-red-500 ml-0.1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setCharCount(value.length);
            field.onChange(e);
          };
          return (
            <div className="flex flex-col gap-1 relative">
              <Textarea
                {...rest}
                {...field}
                id={name}
                ref={textareaRef}
                rows={rows}
                readOnly={isSubmitting || readonly}
                disabled={rest.disabled}
                onChange={handleChange}
                maxLength={maxCharactersLength}
                className="pb-10"
              />
              {!disableGutter && (
                <div className="h-2">
                  <ErrorText message={fieldState.error?.message || ""} />
                </div>
              )}

              {(showAttachmentButton || showCharacterCount) && (
                <div
                  className={cn(
                    "absolute bottom-2 flex items-center justify-between p-3 pointer-events-none w-full",
                    !showAttachmentButton && "justify-end"
                  )}
                >
                  {showAttachmentButton && (
                    <ImageUploadField
                      handleUploads={handleUploads}
                      isSubmitting={isSubmitting || disableAttchmentButton}
                    />
                  )}

                  {showCharacterCount && (
                    <div className="text-sm text-[#A3A3A3] bg-white/80 backdrop-blur-sm">
                      {charCount}/{maxCharactersLength} characters
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }}
      />
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
              onClick={() => onAttachmentClick?.(file.url || "")}
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

export default FormTextareaField;
