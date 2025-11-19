import React from "react";
import { GridItem } from "@/components/ui/Grid";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { SelectableFormOptions } from "@/utilities/types/common/SelectableFormOptions";

type CheckboxFieldProps = {
  name: string;
  label: string;
  size?: GridItemProps["size"];
  required?: boolean;
  options: SelectableFormOptions[];
  labelStyles?: string;
};

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  required,
  size = 12,
  options,
  labelStyles,
  ...rest
}) => {
  const [value, setValue] = React.useState();

  return (
    <GridItem className="pt-2" size={size}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.1">*</span>}
        </label>
      )}

      <div className="flex flex-col items-start justify-start gap-4">
        {options?.map((option) => {
          const checkboxId = `${name}-${option.label}`;
          return (
            <div key={option.value} className="flex items-start gap-3">
              <Checkbox
                id={checkboxId}
                checked={value}
                className='transition-colors duration-200"'
              />
              <label
                htmlFor={checkboxId}
                className={cn(
                  "text-sm text-[#A3A3A3] cursor-pointer",
                  labelStyles
                )}
              >
                {option.label}
              </label>
              {/* <ErrorText message={"Required!"} /> */}
            </div>
          );
        })}
      </div>
    </GridItem>
  );
};

export default CheckboxField;
