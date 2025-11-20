import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GridItem } from "@/components/ui/Grid";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import ErrorText from "./error-text";
import { Label } from "../ui/label";

export type TextareaFieldProps = {
  name: string;
  label: string;
  size?: GridItemProps["size"];
  disableGutter?: boolean;
  className?: string;
  inputStyles?: string;
  errorMessage?: string;
  onChange?: (value: string) => void;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "type" | "label"
>;

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  name,
  required,
  rows = 4,
  placeholder,
  className,
  size = 6,
  disableGutter = false,
  errorMessage,
}) => {
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
      <div className="relative flex flex-col gap-1">
        <Textarea
          id={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          placeholder={placeholder}
        />

        {!disableGutter && (
          <div className="h-2">
            <ErrorText message={errorMessage || ""} />
          </div>
        )}
      </div>
    </GridItem>
  );
};

export default TextareaField;
