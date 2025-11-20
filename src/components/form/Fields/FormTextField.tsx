import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input, InputProps } from "@/components/ui/input";
import { GridItem } from "@/components/ui/Grid";
import ErrorText from "./ErrorText";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import { Label } from "@/components/ui/label";

type FormTextFieldProps = {
  name: string;
  label: string;
  type?: string;
  size?: GridItemProps["size"];
  disableGutter?: boolean;
  className?: string;
  inputFieldStyles?: string;
  onFileChange?: (file: File) => void;
} & Omit<InputProps, "name" | "type" | "label">;

const FormTextField: React.FC<FormTextFieldProps> = ({
  name,
  label,
  type = "text",
  required,
  size = 6,
  readOnly = false,
  disableGutter = false,
  className,
  inputFieldStyles,
  onFileChange,
  ...rest
}) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <GridItem className={className} size={size}>
      {label && (
        <Label
          htmlFor={name}
          className="text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {required && <span className="text-red-500 ml-0.1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <Input
              {...field}
              {...rest}
              readOnly={readOnly || isSubmitting}
              id={name}
              type={type}
            />

            {!disableGutter && (
              <div className="h-2">
                <ErrorText message={fieldState.error?.message || ""} />
              </div>
            )}
          </>
        )}
      />
    </GridItem>
  );
};

export default FormTextField;
