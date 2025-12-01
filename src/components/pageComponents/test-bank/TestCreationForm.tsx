import FormTextareaField from "@/components/form/Fields/FormTextareaField";
import FormTextField from "@/components/form/Fields/FormTextField";
import Form from "@/components/form/Form";
import CustomContentCard from "@/components/shared/CustomContentCard";
import z from "zod";
import { GridItem } from "@/components/ui/Grid";
import AddSubtest from "./AddSubtest";
import FormResetButton from "@/components/form/Fields/FormResetButton";
import { Save, X } from "lucide-react";
import FormButton from "@/components/form/Fields/FormButton";
import useCreateTestDefinition from "@/hooks/test-subtest-definitions/useCreateTestDefinition";
import useGetLoggedInUser from "@/hooks/auth/useGetLoggedInUser";

type Props = {
  activeTab: string;
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingTest?: boolean;
};

function TestCreationForm({
  activeTab,
  setIsCreating,
  isEditingTest = false,
}: Props) {
  const { mutateAsync: createTest, isPending } = useCreateTestDefinition();
  const { data: user } = useGetLoggedInUser();

  const initialValues = {
    test_name: "",
    test_aliases: [],
    subtests: [],
  };

  const validationSchema = z.object({
    test_name: z.string().min(1, "Test name is required"),
    test_aliases: z
      .string()
      .transform((val) =>
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
      .pipe(z.array(z.string())),
    subtests: z.array(z.any()),
  });

  type TestDefValidationSchema = z.infer<typeof validationSchema>;
  const handleSubmit = async (values: TestDefValidationSchema) => {
    const testToCreate = {
      ...values,
      is_system_template: activeTab === "system",
      subtest_placeholders: values.subtests.map((s) => s.placeholder),
      created_by: user?.email,
      created_by_id: user?.id,
    };

    await createTest({ testDefData: testToCreate });
    setIsCreating(false);
  };

  return (
    <CustomContentCard
      title={isEditingTest ? "" : "Create New Test Definition"}
      description={
        isEditingTest
          ? ""
          : activeTab === "system"
          ? `✓ As an admin, this test definition will be automatically
                    visible to all users (Global)`
          : ""
      }
      cardStyles="mb-6"
      descriptionStyles="text-sm text-blue-600 mt-2"
    >
      <Form
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        <FormTextField
          name="test_name"
          label="Test Name"
          placeholder="e.g., WAIS-5, WISC-V"
        />
        <FormTextareaField
          name="test_aliases"
          label="Test Aliases (comma-separated)"
          placeholder="e.g., WAIS-V, WAIS 5, Wechsler Adult Intelligence Scale"
        />

        <GridItem>
          <AddSubtest />
        </GridItem>

        <GridItem className="flex items-center justify-end gap-3 pt-4 border-t">
          <FormResetButton
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setIsCreating(false);
            }}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </FormResetButton>
          <FormButton disabled={isPending} className="!my-0">
            <Save className="w-4 h-4 mr-2" />
            Create Test Definition
          </FormButton>
        </GridItem>
      </Form>
    </CustomContentCard>
  );
}

export default TestCreationForm;
