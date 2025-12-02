import React from "react";
import { Save, X } from "lucide-react";
import CustomContentCard from "@/components/shared/CustomContentCard";
import Form from "@/components/form/Form";
import z from "zod";
import FormTextField from "@/components/form/Fields/FormTextField";
import FormSelectField from "@/components/form/Fields/FormSelectField";
import { TEMPLATE_CATEGORY_OPTIONS } from "@/utilitites/constants";
import FormButton from "@/components/form/Fields/FormButton";
import { GridItem } from "@/components/ui/Grid";
import FormResetButton from "@/components/form/Fields/FormResetButton";
import { getAvailablePlaceholders } from "@/components/templates/placeholderUtils";
import useCreateReportTemplate from "@/hooks/report-templates/useCreateReportTemplate";
import type {
  PlaceholdersType,
  ReportTemplateType,
  TemplateCategory,
} from "@/utilitites/types/ReportTemplate";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useUpdateReportTemplate from "@/hooks/report-templates/useUpdateReportTemplate";
import useUserStore from "@/store/userStore";
import useGetAllTestDefinitions from "@/hooks/test-subtest-definitions/useGetAllTestDefinitions";

type Props = {
  template?: ReportTemplateType;
  mainContainerStyles?: string;
  childContainerStyles?: string;
  saveButtonText?: string;
  resetButtonType?: "submit" | "reset" | "button" | undefined;
  onReset?: () => void;
  isLoading?: boolean;
};

function CreateTemplateForm({
  template,
  mainContainerStyles,
  childContainerStyles,
  saveButtonText = "Create & Edit Content",
  resetButtonType = "reset",
  isLoading = false,
  onReset,
}: Props) {
  const { mutateAsync: createTemplate, isPending } = useCreateReportTemplate();
  const { data: testDefinitions } = useGetAllTestDefinitions();
  const user = useUserStore(React.useCallback((state) => state.user, []));
  const { mutateAsync: updateTemplate, isPending: updateLoading } =
    useUpdateReportTemplate();
  const navigate = useNavigate();
  const hasPendingTask = isPending || updateLoading || isLoading;

  const intialFormData = {
    template_name: template?.template_name || "",
    test_type: template?.test_type || "",
    category: template?.category || "cognitive",
  };
  const validationSchema = z.object({
    template_name: z.string().min(1, "Template name is required"),
    test_type: z.string().min(1, "Test type is required"),
    category: z.string(),
  });

  type ValidationSchemaType = z.infer<typeof validationSchema>;
  const handleSubmit = async (values: ValidationSchemaType) => {
    const category = values.category as TemplateCategory;

    if (template) {
      const updatedTemplate = {
        ...template,
        ...values,
        category,
      };

      await updateTemplate({
        id: template.id,
        templateData: updatedTemplate,
      });
      onReset?.();
      return;
    }

    const placeholders = await getAvailablePlaceholders(
      values.test_type,
      undefined,
      user,
      testDefinitions
    );
    const templatePayload = {
      ...values,
      category,
      template_content: "New Template Content",
      available_placeholders: placeholders as PlaceholdersType[],
      is_system_template: false,
      is_active: true,
      is_sample: false,
      is_active_template: true,
      created_by: user?.email,
      created_by_id: user?.id,
    };

    const newTemplate = await createTemplate({ template: templatePayload });

    navigate(createPageUrl(`TemplateEditor?id=${newTemplate.id}`));
  };

  return (
    <CustomContentCard
      title="Create New Template"
      contentContainerStyles={cn("mb-6", childContainerStyles)}
      cardStyles={mainContainerStyles}
    >
      <Form
        initialValues={intialFormData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <FormTextField
          size={3}
          name="template_name"
          label="Template Name"
          placeholder="e.g., My WISC-V Cognitive Report"
          required
        />
        <FormTextField
          size={3}
          name="test_type"
          label="Test Type"
          placeholder="e.g., WISC-V, WAIS-IV, WJ-IV"
          required
        />
        <FormSelectField
          name="category"
          label="Category"
          options={TEMPLATE_CATEGORY_OPTIONS}
        />
        <GridItem className="flex items-center justify-end gap-3">
          <FormResetButton
            variant="outline"
            className="px-4"
            disabled={hasPendingTask}
            type={resetButtonType}
            onClick={onReset}
          >
            <X /> Cancel
          </FormResetButton>
          <FormButton
            className="text-white !my-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
            }}
            disabled={hasPendingTask}
          >
            <Save />
            {saveButtonText}
          </FormButton>
        </GridItem>
      </Form>
    </CustomContentCard>
  );
}

export default CreateTemplateForm;
