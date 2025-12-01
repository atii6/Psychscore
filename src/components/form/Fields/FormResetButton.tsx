import { Button, type ButtonProps } from "@/components/ui/button";
import { GridItemProps } from "@/components/ui/Grid/GridItem";
import { useFormContext } from "react-hook-form";

type FormButtonProps = ButtonProps & GridItemProps;

function FormResetButton({ ...props }: FormButtonProps) {
  const { children, className, variant, ...rest } = props;
  const { formState } = useFormContext();
  return (
    <Button
      {...rest}
      size="lg"
      className={className}
      variant={variant}
      disabled={formState.isSubmitting}
    >
      {children}
    </Button>
  );
}

export default FormResetButton;
