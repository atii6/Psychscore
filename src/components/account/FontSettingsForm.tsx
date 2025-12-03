import { Save, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Form from "../form/Form";
import FormSelectField from "../form/Fields/FormSelectField";
import FormButton from "../form/Fields/FormButton";
import z from "zod";
import useUpdateUser from "@/hooks/users/useUpdateUser";
import type {
  AppUserAttributes,
  ReportFontFamily,
} from "@/utilitites/types/User";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GridItem } from "../ui/Grid";

type FontSettingsFormProps = { userData: AppUserAttributes };

const fontFamilyOptions = [
  { value: "Times New Roman", label: "Times New Roman (Traditional)" },
  { value: "Arial", label: "Arial (Sans-serif)" },
  { value: "Calibri", label: "Calibri (Modern)" },
  { value: "Georgia", label: "Georgia (Elegant)" },
  { value: "Verdana", label: "Verdana (Clean)" },
];

function FontSettingsForm({ userData }: FontSettingsFormProps) {
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const queryClient = useQueryClient();
  const initialValues = {
    report_font_family: userData.report_font_family || "Times New Roman",
  };

  const validationSchema = z.object({
    report_font_family: z.string().min(1, "Font family is required"),
  });

  type ValidationSchemaType = z.infer<typeof validationSchema>;

  const handleSaveReportSettings = async (values: ValidationSchemaType) => {
    await updateUser(
      {
        id: userData.id,
        userData: {
          ...userData,
          report_font_family: values.report_font_family as ReportFontFamily,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["users", userData.id],
          });
          toast.success("Font settings updated.");
        },
      }
    );
  };
  return (
    <Card
      className="border-0 shadow-lg rounded-2xl"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader
        className="pb-4"
        style={{ borderBottom: "2px solid var(--light-blue)" }}
      >
        <CardTitle className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--light-blue)" }}
          >
            <Type
              className="w-5 h-5"
              style={{ color: "var(--secondary-blue)" }}
            />
          </div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Font Settings
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Choose the default font for your reports
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Form
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSaveReportSettings}
          >
            <FormSelectField
              name="report_font_family"
              label="Report Font Family"
              options={fontFamilyOptions}
            />
            <GridItem className="flex justify-end">
              <FormButton
                className="text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
                disabled={isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Font Settings
              </FormButton>
            </GridItem>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}

export default FontSettingsForm;
