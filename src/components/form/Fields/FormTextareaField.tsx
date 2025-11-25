import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import ErrorText from "./ErrorText";
import { GridItem } from "@/components/ui/Grid";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type FormTextareaFieldProps = {
  name: string;
  label: string;
  size?: GridItemProps["size"];
  disableGutter?: boolean;
  className?: string;
  inputStyles?: string;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "type" | "label"
>;

const FormTextareaField: React.FC<FormTextareaFieldProps> = ({
  name,
  label,
  required,
  size = 6,
  rows = 4,
  disableGutter = false,
  className,
  readOnly = false,
  inputStyles,
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
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          return (
            <>
              <Textarea
                {...field}
                {...rest}
                readOnly={isSubmitting || readOnly}
                id={name}
                rows={rows}
              />
              {!disableGutter && (
                <div className="h-2">
                  <ErrorText message={fieldState.error?.message || ""} />
                </div>
              )}
            </>
          );
        }}
      />
    </GridItem>
  );
};

export default FormTextareaField;
