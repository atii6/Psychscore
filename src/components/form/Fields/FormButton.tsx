import { useFormState } from "react-hook-form";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { GridItemProps } from "@/components/ui/Grid/GridItem";

type FormButtonProps = ButtonProps & GridItemProps;

const FormButton = ({ ...props }: FormButtonProps) => {
  const { isSubmitting, isValid } = useFormState();
  const { children, className, disabled, variant, ...rest } = props;
  const isDisabled = isSubmitting || !isValid || disabled;

  return (
    <Button
      {...rest}
      disabled={isDisabled}
      type="submit"
      size="lg"
      className={className}
      variant={variant}
    >
      {isSubmitting ? "Loading..." : children}
    </Button>
  );
};

export default FormButton;
