import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import ErrorText from "./ErrorText";
import { GridItem } from "@/components/ui/Grid";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import type { SelectableFormOptions } from "@/utilities/types/common/SelectableFormOptions";

type RadioButtonFormFieldProps = {
  name: string;
  label: string;
  size?: GridItemProps["size"];
  required?: boolean;
  options: SelectableFormOptions[];
  orientation?: "horizontal" | "vertical";
  className?: string;
};

const RadioButtonFormField: React.FC<RadioButtonFormFieldProps> = ({
  name,
  label,
  required,
  size = 12,
  options,
  orientation = "horizontal",
  className,
  ...rest
}) => {
  const { control } = useFormContext();

  return (
    <GridItem className={className} size={size}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.1">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          return (
            <RadioGroup onValueChange={field.onChange} {...field}>
              <div
                className={`flex gap-2 ${
                  orientation === "vertical" ? "flex-col " : ""
                }`}
              >
                {options.map((option) => (
                  <div key={option.value}>
                    <label
                      htmlFor={`${name}-${option.value}`}
                      className={`
                  flex items-center gap-3 p-2 rounded-lg border-2 cursor-pointer transition-all duration-200
                  hover:border-blue-200 hover:bg-blue-50/50
                  ${
                    field.value === option.value
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-gray-200 bg-white"
                  }
                `}
                    >
                      <RadioGroupItem
                        {...rest}
                        value={option.value.toString()}
                        id={`${name}-${option.value}`}
                        className="data-[state=checked]:border-[#385C80] data-[state=checked]:bg-inherit"
                      />
                      <span className="font-medium text-gray-700 select-none">
                        {option.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <ErrorText message={fieldState.error?.message || ""} />
            </RadioGroup>
          );
        }}
      />
    </GridItem>
  );
};

export default RadioButtonFormField;
