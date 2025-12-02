import React from "react";
import FormButton from "@/components/form/Fields/FormButton";
import FormResetButton from "@/components/form/Fields/FormResetButton";
import FormSelectField from "@/components/form/Fields/FormSelectField";
import FormTextareaField from "@/components/form/Fields/FormTextareaField";
import FormTextField from "@/components/form/Fields/FormTextField";
import Form from "@/components/form/Form";
import CustomContentCard from "@/components/shared/CustomContentCard";
import { GridItem } from "@/components/ui/Grid";
import useUserStore from "@/store/userStore";
import useCreateScoreDescriptor from "@/hooks/user-score-descriptor/useCreateUserScoreDescriptor";
import useUpdateScoreDescriptor from "@/hooks/user-score-descriptor/useUpdateUserScoreDescriptor";
import { SCORE_TYPE_OPTIONS } from "@/utilitites/constants";
import type { ScoreType } from "@/utilitites/types/TestSubtestDefinitions";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { Save, X } from "lucide-react";
import z from "zod";

type Props = {
  descriptor?: UserScoreDescriptorType | null;
  onCancel: () => void;
  cardStyles?: string;
};

function ScoreDescriptorForm({ descriptor, onCancel, cardStyles }: Props) {
  const {
    mutateAsync: updateScoreDescriptor,
    isPending: isUpdatingDescriptor,
  } = useUpdateScoreDescriptor();
  const User = useUserStore(React.useCallback((state) => state.user, []));
  const { mutateAsync: createScoreDescriptor, isPending: isCreatePending } =
    useCreateScoreDescriptor();
  const initialValues = {
    score_type: descriptor?.score_type || "standard",
    min_score: descriptor?.min_score || 0,
    max_score: descriptor?.max_score || 0,
    descriptor: descriptor?.descriptor || "",
    percentile_range: descriptor?.percentile_range || "",
    clinical_interpretation: descriptor?.clinical_interpretation || "",
  };

  const validationSchema = z.object({
    score_type: z.string().min(1, "Score type is required"),
    min_score: z.coerce.number().min(1, "Min score is required"),
    max_score: z.coerce.number().min(1, "Max score is required"),
    descriptor: z.string().min(1, "Descriptor is required"),
    percentile_range: z.string().min(1, "Percentile range is required"),
    clinical_interpretation: z.string().optional(),
  });

  type ValidationSchemaType = z.infer<typeof validationSchema>;
  const handleSubmit = async (values: ValidationSchemaType) => {
    const descriptorData = {
      ...descriptor,
      ...values,
      score_type: values.score_type as ScoreType,
      min_score: values.min_score,
      max_score: values.max_score,
      descriptor: values.descriptor,
      created_by_id: User?.id,
      created_by: User?.email,
    };

    if (descriptor) {
      await updateScoreDescriptor({
        id: descriptor.id,
        descriptorData: { ...descriptorData, id: descriptor.id },
      });
      onCancel();
      return;
    }

    await createScoreDescriptor({
      descriptorData,
    });

    onCancel();
  };
  return (
    <CustomContentCard
      title={
        descriptor ? "Edit Custom Descriptor" : "Add New Custom Descriptor"
      }
      cardStyles={cardStyles}
    >
      <Form
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <FormSelectField
          name="score_type"
          label="Score Type"
          options={SCORE_TYPE_OPTIONS}
          required
        />

        <FormTextField
          size={2}
          name="min_score"
          label="Min Score"
          placeholder="70"
          required
        />
        <FormTextField
          size={2}
          name="max_score"
          label="Min Score"
          placeholder="79"
          required
        />
        <FormTextField
          size={2}
          name="percentile_range"
          label="Percentile Range"
          placeholder="3-8"
          required
        />
        <FormTextField
          name="descriptor"
          label="Custom Descriptor"
          placeholder="e.g., Significantly Below Average, Borderline"
          required
        />
        <FormTextareaField
          name="clinical_interpretation"
          label="Clinical Interpretation"
          placeholder="Additional clinical notes or interpretation guidance for this score range..."
        />
        <GridItem className="flex items-center justify-end gap-3">
          <FormResetButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isCreatePending || isUpdatingDescriptor}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </FormResetButton>
          <FormButton
            className="text-white !my-0"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
            }}
            disabled={isCreatePending || isUpdatingDescriptor}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Descriptor
          </FormButton>
        </GridItem>
      </Form>
    </CustomContentCard>
  );
}

export default ScoreDescriptorForm;
