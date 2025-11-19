import React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { GridItem } from "@/components/ui/Grid";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import ErrorText from "../form/Fields/ErrorText";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  name: string;
  label: string;
  error?: string;
  size?: GridItemProps["size"];
  disableGutter?: boolean;
  fieldButtonStyles?: string;
  disableFieldButton?: boolean;
} & Omit<InputProps, "name" | "type" | "label">;

const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  error,
  size = 12,
  required,
  disableGutter = false,
  disableFieldButton = false,
  ...rest
}) => {
  const { className, ...restProps } = rest;
  return (
    <GridItem className={cn("pt-2", className)} size={size}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="flex flex-col gap-1">
        <Input
          id={name}
          name={name}
          required={required}
          disableFieldButton={disableFieldButton}
          {...restProps}
        />
        {!disableGutter && (
          <div className="h-2">
            <ErrorText message={error} />
          </div>
        )}
      </div>
    </GridItem>
  );
};

export default TextField;
