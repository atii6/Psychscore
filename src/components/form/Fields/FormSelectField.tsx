import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import ErrorText from "./ErrorText";
import GridItem, { type GridItemProps } from "@/components/ui/Grid/GridItem";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type SelectableFormOptions = {
  value: string | number | boolean;
  label: string;
};

type FormSelectFieldProps = {
  name: string;
  label: string;
  options: SelectableFormOptions[];
  required?: boolean;
  size?: GridItemProps["size"];
  disabled?: boolean;
  onChange?: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
  className?: string;
  value?: string;
  fieldStyles?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

const FormSelectField: React.FC<FormSelectFieldProps> = ({
  name,
  label,
  options,
  required,
  disabled,
  size = 6,
  readonly,
  onChange,
  placeholder,
  className,
  value,
}) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  const isSelectDisabled = isSubmitting || disabled || readonly;

  return (
    <GridItem className={className} size={size}>
      {label && (
        <Label
          htmlFor="gender"
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
          {required && <span className="text-red-500 ml-0.1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          return (
            <>
              <Select
                {...field}
                onValueChange={(value) => {
                  field.onChange(value);
                  onChange && onChange(value);
                }}
                value={value}
                disabled={isSelectDisabled}
              >
                <SelectTrigger>
                  <SelectValue
                    className="text-[#efefef]"
                    placeholder={placeholder}
                  />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectGroup>
                    {options.map((option) => (
                      <SelectItem
                        key={option.label}
                        value={String(option.value)}
                        className="hover:!text-[#385C80]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <ErrorText message={fieldState.error?.message} />
            </>
          );
        }}
      />
    </GridItem>
  );
};

export default FormSelectField;
