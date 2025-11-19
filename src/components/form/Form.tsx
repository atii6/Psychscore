import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  DefaultValues,
  FieldValues,
  SubmitHandler,
} from "react-hook-form";
import type { ZodTypeAny } from "zod";
import { cn } from "@/lib/utils";
import { Grid } from "../ui/Grid";

type Props<Value extends FieldValues> = {
  onSubmit: SubmitHandler<Value>;
  children: React.ReactNode;
  validationSchema: ZodTypeAny;
  initialValues: DefaultValues<Value>;
  className?: string;
  isLoading?: boolean;
  resetAfterSubmit?: boolean;
};

export default function Form<Values extends FieldValues>({
  onSubmit,
  validationSchema,
  children,
  initialValues,
  className = "",
  isLoading = false,
  resetAfterSubmit = false,
}: Props<Values>) {
  const [isInitialValuesSetByResponse, setIsInitialValuesSetByResponse] =
    React.useState(false);
  const methods = useForm<Values>({
    defaultValues: initialValues,
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  React.useEffect(() => {
    if (!isInitialValuesSetByResponse && !isLoading) {
      methods.reset(initialValues);
      setIsInitialValuesSetByResponse(true);
    }
    // eslint-disable-next-line
  }, [initialValues]);

  const _handleSubmit = async (val: Values) => {
    await onSubmit(val);
    if (resetAfterSubmit) {
      methods.reset();
    }
  };
  return (
    <FormProvider
      {...methods}
      reset={() => {
        console.info("Reset");
      }}
    >
      <form
        onSubmit={methods.handleSubmit(_handleSubmit, (oninvalid) => {
          console.info("schema failed", oninvalid);
        })}
        onReset={() => methods.reset(initialValues)}
        className={cn("", className)}
      >
        <Grid>{children}</Grid>
      </form>
    </FormProvider>
  );
}
