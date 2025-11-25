import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import ErrorText from "./ErrorText";
import { GridItem } from "@/components/ui/Grid";
import { Checkbox } from "@/components/ui/checkbox";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import { Label } from "@/components/ui/label";
import { SelectableFormOptions } from "./FormSelectField";

type CheckboxFieldProps = {
  name: string;
  label: string;
  size?: GridItemProps["size"];
  required?: boolean;
  options: SelectableFormOptions[];
  className?: string;
  disabled?: boolean;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  required,
  size = 6,
  options,
  className,
  disabled,
  ...rest
}) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <GridItem className={className} size={size}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#262626]">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            {options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox
                  {...rest}
                  {...field}
                  disabled={isSubmitting || field.disabled || disabled}
                  id={`${option.label}-${field.name}-${index}`}
                  checked={field.value?.includes(option.value)}
                  onCheckedChange={(checked) => {
                    return checked
                      ? field.onChange([...field.value, option.value])
                      : field.onChange(
                          field.value?.filter(
                            (value: string) => value !== option.value
                          )
                        );
                  }}
                  className='transition-colors duration-200"'
                />
                <Label
                  htmlFor={option.label}
                  className="cursor-pointer"
                  style={{ color: "var(--text-primary)" }}
                >
                  {option.label}
                </Label>
                <ErrorText message={fieldState.error?.message || ""} />
              </div>
            ))}
          </>
        )}
      />
    </GridItem>
  );
};

export default CheckboxField;
