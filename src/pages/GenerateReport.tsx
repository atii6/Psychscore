import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileText, BookOpen } from "lucide-react";
import { format } from "date-fns";
import useGetAllReportTemplates from "@/hooks/report-templates/useGetAllReportTemplates";
import useGetAssessmentByID from "@/hooks/assessments/useGetAssessmentById";
import {
  addScorePlaceholders,
  buildPlaceholderMap,
  generateScoreTable,
  renderTestTemplate,
} from "@/utilitites/helpers/reportTemplateHelpers";
import CustomContentCard from "@/components/shared/CustomContentCard";
import useCreateGeneratedReport from "@/hooks/generated-reports/useCreateGeneratedReport";
import Form from "@/components/form/Form";
import { GridItem } from "@/components/ui/Grid";
import FormSelectField, {
  type SelectableFormOptions,
} from "@/components/form/Fields/FormSelectField";
import z from "zod";
import FormButton from "@/components/form/Fields/FormButton";
import { useFormContext } from "react-hook-form";

const RenderFormFields = ({
  testOptions,
  templateOptions,
  setSelectedTest,
}: {
  testOptions: SelectableFormOptions[];
  templateOptions: SelectableFormOptions[];
  setSelectedTest: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { watch } = useFormContext();
  const selectedTest = watch("selected_test");

  React.useEffect(() => {
    setSelectedTest(selectedTest);
  }, [selectedTest, setSelectedTest]);
  return (
    <>
      {testOptions.length > 0 && (
        <FormSelectField
          name="selected_test"
          label="Select Test for Report"
          options={testOptions}
        />
      )}

      <FormSelectField
        name="selected_template"
        label="Select Template"
        options={templateOptions}
        disabled={templateOptions.length === 0}
      />
    </>
  );
};

export default function GenerateReportPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("assessmentId");
  const assessmentId = Number(id);

  const navigate = useNavigate();
  const { data: assessment, isLoading } = useGetAssessmentByID(assessmentId);
  const { data: reportTemplates, isLoading: isLoadingTemplates } =
    useGetAllReportTemplates();
  const { mutateAsync: generateReport, isPending: isGenerating } =
    useCreateGeneratedReport();
  const [selectedTest, setSelectedTest] = React.useState<string>("");

  const initialValues = { selected_test: "", selected_template: "" };
  const validationSchema = z.object({
    selected_test: z.string().min(1, "Test is required"),
    selected_template: z.string().min(1, "Template is required"),
  });
  type ValidationSchemaType = z.infer<typeof validationSchema>;

  const testOptions = React.useMemo(() => {
    const tests = [
      ...new Set(assessment?.extracted_scores?.map((s) => s.test_name)),
    ];
    return tests.map((t) => ({ value: t, label: t }));
  }, [assessment]);

  const templates = React.useMemo(() => {
    if (!selectedTest) return [];
    return (
      reportTemplates?.filter((t) => t.template_name === selectedTest) || []
    );
  }, [selectedTest, reportTemplates]);

  const templateOptions = React.useMemo(() => {
    return (
      templates?.map((t) => ({
        value: String(t.id),
        label: t.template_name,
      })) || []
    );
  }, [selectedTest, reportTemplates]);

  const handleGenerateReport = async (values: ValidationSchemaType) => {
    if (!assessment) return;

    const selectedTest = values.selected_test;
    const selectedTemplateId = Number(values.selected_template);

    if (!selectedTest || !selectedTemplateId) return;

    try {
      const selectedTemplate = reportTemplates?.find(
        (t) => t.id === selectedTemplateId
      );

      if (!selectedTemplate?.template_content?.trim()) {
        return;
      }

      const scoresForTest =
        assessment.extracted_scores?.filter(
          (s) => s.test_name === selectedTest
        ) || [];

      const scoreTableHtml = await generateScoreTable(
        scoresForTest,
        selectedTest
      );

      let placeholderMap = buildPlaceholderMap(
        assessment,
        selectedTest,
        scoreTableHtml
      );

      placeholderMap = addScorePlaceholders(scoresForTest, placeholderMap);

      const finalContent = renderTestTemplate(
        selectedTemplate.template_content,
        placeholderMap
      );

      const reportData = {
        assessment_id: assessment.id,
        template_id: selectedTemplate.id,
        report_content: finalContent,
        report_title: `Psychological Report for ${assessment.client_first_name} ${assessment.client_last_name}`,
        client_name: `${assessment.client_first_name} ${assessment.client_last_name}`,
      };

      const report = await generateReport({ reportData });

      navigate(createPageUrl(`ViewReport?id=${report.id}`));
    } catch (error) {
      console.error("Report generation error:", error);
    }
  };

  if (isLoading || isLoadingTemplates) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "var(--primary-blue)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Reports"))}
            className="rounded-xl border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Generate Report
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Select a template to generate a narrative report
            </p>
          </div>
        </div>

        <CustomContentCard
          title="Assessment Details"
          Icon={FileText}
          iconProps={{ className: "w-5 h-5 text-[var(--secondary-blue)]" }}
          cardStyles="mb-6"
          contentContainerStyles="text-[var(--text-primary)]"
        >
          <p>
            <strong>Client:</strong> {assessment?.client_first_name}{" "}
            {assessment?.client_last_name}
          </p>
          <p>
            <strong>Test Date:</strong>{" "}
            {assessment?.test_date
              ? format(new Date(assessment.test_date), "MMMM d, yyyy")
              : "N/A"}
          </p>
        </CustomContentCard>

        <Form
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleGenerateReport}
        >
          <GridItem>
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <BookOpen
                    className="w-5 h-5"
                    style={{ color: "var(--secondary-blue)" }}
                  />
                  Select Report Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Dropdown */}
                <RenderFormFields
                  templateOptions={templateOptions}
                  testOptions={testOptions}
                  setSelectedTest={setSelectedTest}
                />
                {/* No templates found */}
                {selectedTest && templates.length === 0 && (
                  <p
                    className="text-center text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No templates found for "{selectedTest}".{" "}
                    <a
                      href={createPageUrl("Templates")}
                      className="text-blue-600 font-medium"
                    >
                      Create one here.
                    </a>
                  </p>
                )}
                <div className="flex justify-end">
                  <FormButton
                    disabled={isGenerating}
                    className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                    }}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <FileText className="w-5 h-5 mr-2" />
                    )}
                    {isGenerating ? "Generating..." : "Generate & View Report"}
                  </FormButton>
                </div>
              </CardContent>
            </Card>
          </GridItem>
        </Form>
      </div>
    </div>
  );
}
