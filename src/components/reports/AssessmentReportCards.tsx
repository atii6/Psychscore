import React from "react";
import { Card, CardContent } from "../ui/card";
import { FileText } from "lucide-react";
import { Badge } from "../ui/badge";
import ReportActions from "./ReportActions";
import type { AssessmentType } from "@/utilitites/types/Assessment";
import { format } from "date-fns";
import useGetAllReportTemplates from "@/hooks/report-templates/useGetAllReportTemplates";
import useGetAllTestDefinitions from "@/hooks/test-subtest-definitions/useGetAllTestDefinitions";
import {
  addScorePlaceholders,
  buildPlaceholderMap,
  capitalizePronounsInSentences,
  generateScoreTable,
  getUserPreferences,
  matchTemplateForTest,
  renderTestTemplate,
  resolveCanonicalTestName,
  wrapFinalReport,
} from "@/utilitites/helpers/reportTemplateHelpers";
import type { GeneratedReport } from "@/utilitites/types/GeneratedReports";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import useCreateGeneratedReport from "@/hooks/generated-reports/useCreateGeneratedReport";
import useUpdateAssessment from "@/hooks/assessments/useUpdateAssessment";
import { toast } from "sonner";
import useGetLoggedInUser from "@/hooks/auth/useGetLoggedInUser";

type Props = {
  assessment: AssessmentType;
  reportCounts?: Record<number, number>;
  setQuickViewReport: React.Dispatch<
    React.SetStateAction<GeneratedReport | null>
  >;
  GeneratedReport?: GeneratedReport[];
  setViewingScores: React.Dispatch<React.SetStateAction<AssessmentType | null>>;
};

function AssessmentReportCards({
  assessment,
  reportCounts,
  setQuickViewReport,
  GeneratedReport,
  setViewingScores,
}: Props) {
  const { data: ReportTemplate } = useGetAllReportTemplates();
  const { data: TestSubtestDefinition } = useGetAllTestDefinitions();
  const { data: User } = useGetLoggedInUser();
  const { mutateAsync: updateAssessment, isPending: isUpdatingAssessment } =
    useUpdateAssessment();
  const { mutateAsync: createReport, isPending: isCreatingReport } =
    useCreateGeneratedReport();

  const navigate = useNavigate();

  const userTemplates = React.useMemo(
    () => ReportTemplate?.filter((t) => t.created_by === User?.email) ?? [],
    [ReportTemplate]
  );

  const systemTemplates = React.useMemo(
    () => ReportTemplate?.filter((t) => t.is_system_template) ?? [],
    [ReportTemplate]
  );

  const allTestDefinitions = React.useMemo(() => {
    const user =
      TestSubtestDefinition?.filter((t) => t.created_by === User?.email) ?? [];
    const sys =
      TestSubtestDefinition?.filter((t) => t.is_system_template) ?? [];

    return [...user, ...sys].sort((a, b) =>
      a.test_name.localeCompare(b.test_name)
    );
  }, [TestSubtestDefinition]);

  const handleQuickViewReport = React.useCallback(
    async (assessmentId: number) => {
      const reports = GeneratedReport?.filter(
        (report) => String(report.assessment_id) === String(assessmentId)
      );

      if (reports && reports.length > 0) {
        setQuickViewReport(reports[0]);
      } else {
        toast.info(
          "No reports found for this assessment. Please generate one first."
        );
      }
    },
    []
  );

  const hasReport = reportCounts && reportCounts[assessment.id] > 0;

  const proceedWithGeneration = React.useCallback(
    async (
      assessment: AssessmentType,
      resolvedTemplates: Record<string, ReportTemplateType>
    ) => {
      try {
        const userPreferences = await getUserPreferences();
        let combinedReportContent = "";
        let hasContent = false;
        for (const testName of Object.keys(resolvedTemplates)) {
          const template = resolvedTemplates[testName];
          if (!template?.template_content?.trim()) {
            console.warn(`No valid template for test: ${testName}`);

            combinedReportContent += `
            <div>
              <h3>${testName}</h3>
              <p><em>No matching template found.</em></p>
            </div>
            <hr style="margin:2rem 0; border:none; border-top:1px solid #e2e8f0;"/>
          `;
            continue;
          }

          hasContent = true;
          const scoresForTest = assessment.extracted_scores?.filter(
            (s) => s.test_name === testName
          );
          const scoreTableHtml = await generateScoreTable(
            scoresForTest || [],
            testName,
            userPreferences
          );
          let placeholderMap = buildPlaceholderMap(
            assessment,
            testName,
            scoreTableHtml
          );
          placeholderMap = addScorePlaceholders(
            scoresForTest || [],
            placeholderMap
          );
          const finalContent = renderTestTemplate(
            template.template_content,
            placeholderMap
          );

          combinedReportContent += `
          <div>${finalContent}</div>
          <hr style="margin:2rem 0; border:none; border-top:1px solid #e2e8f0;"/>
        `;
        }
        if (!hasContent) {
          throw new Error("No templates with content were found.");
        }
        const finalReportContent = wrapFinalReport(
          combinedReportContent,
          userPreferences
        );
        const reportData = {
          assessment_id: assessment.id,
          template_id: null,
          report_content: finalReportContent,
          report_title: `Psychological Report for ${assessment.client_first_name} ${assessment.client_last_name}`,
          client_name: `${assessment.client_first_name} ${assessment.client_last_name}`,
        };
        const report = await createReport({ reportData });
        if (assessment.status === "processed") {
          await updateAssessment({
            id: assessment.id,
            assessmentData: { ...assessment, status: "report_generated" },
          });
        }

        navigate(createPageUrl(`ViewReport?id=${report.id}`));
      } catch (error) {
        console.error("Report generation error:", error);
        throw error;
      }
    },
    [navigate, generateScoreTable, capitalizePronounsInSentences]
  );

  const handleAutoGenerateReport = React.useCallback(
    async (assessment: AssessmentType) => {
      try {
        // Extract test names from scores
        const testNames = [
          ...new Set(
            assessment.extracted_scores?.map((s) => s.test_name) ?? []
          ),
        ].filter(Boolean);

        if (testNames.length === 0) {
          throw new Error("No test names found in assessment scores.");
        }

        const resolvedTemplates: Record<string, any> = {};

        // Resolve a template per test
        for (const testName of testNames) {
          const canonicalName = resolveCanonicalTestName(
            testName,
            allTestDefinitions
          );

          const matchedTemplate = matchTemplateForTest(
            canonicalName,
            userTemplates,
            systemTemplates
          );

          resolvedTemplates[testName] = matchedTemplate;
        }

        // Check if any usable template exists
        const usable = Object.values(resolvedTemplates).some((t: any) =>
          t?.template_content?.trim()
        );

        if (!usable) {
          throw new Error(
            `No matching templates found for tests: ${testNames.join(", ")}`
          );
        }

        await proceedWithGeneration(assessment, resolvedTemplates);
      } catch (error: any) {
        if (error?.message?.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please wait before trying again.");
        } else {
          toast.error(error.message || "Failed to generate report.");
        }
      }
    },
    [allTestDefinitions, userTemplates, systemTemplates, proceedWithGeneration]
  );

  const testNames = [
    ...new Set(
      assessment.extracted_scores?.map(
        (s: Record<string, any>) => s.test_name
      ) || []
    ),
  ].join(", ");

  return (
    <Card
      key={assessment.id}
      className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--light-blue)" }}
            >
              <FileText
                className="w-6 h-6"
                style={{ color: "var(--secondary-blue)" }}
              />
            </div>
            <div>
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                {assessment.client_first_name} {assessment.client_last_name}
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                {testNames} •{" "}
                {format(new Date(assessment.created_date || ""), "MMM d, yyyy")}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`font-medium capitalize ${
                    assessment.status === "report_generated"
                      ? "bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100"
                      : assessment.status === "processed"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-800 hover:text-blue-100"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {assessment.status === "report_generated" &&
                  reportCounts &&
                  reportCounts[assessment.id] > 0
                    ? `Report Generated (${reportCounts[assessment.id]})`
                    : assessment.status.replace("_", " ")}
                </Badge>
                {assessment.extracted_scores && (
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {assessment.extracted_scores.length} scores extracted
                  </span>
                )}
              </div>
            </div>
          </div>
          <ReportActions
            assessment={assessment}
            hasReport={hasReport}
            onViewScores={() => setViewingScores(assessment)}
            onViewReport={() => handleQuickViewReport(assessment.id)}
            onGenerateReport={() => handleAutoGenerateReport(assessment)}
            isGeneratingReport={isUpdatingAssessment || isCreatingReport}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default AssessmentReportCards;
