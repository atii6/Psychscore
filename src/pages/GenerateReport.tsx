import React from "react";
// import { Assessment, ReportTemplate, GeneratedReport } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, FileText, BookOpen } from "lucide-react";
import { format } from "date-fns";

export default function GenerateReportPage() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = React.useState(null);
  const [templates, setTemplates] = React.useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [assessmentId, setAssessmentId] = React.useState("");
  const [availableTests, setAvailableTests] = React.useState([]);
  const [selectedTest, setSelectedTest] = React.useState("");

  const handleTestSelection = React.useCallback(async (testName) => {
    setSelectedTest(testName);
    setSelectedTemplateId(""); // Reset template selection
    const templateData = await ReportTemplate.filter({ test_type: testName });
    setTemplates(templateData);
  }, []); // State setters (setSelectedTest, setSelectedTemplateId, setTemplates) are stable, so no dependencies needed.

  const loadData = React.useCallback(
    async (id) => {
      setIsLoading(true);
      const assessmentData = await Assessment.filter({ id }, null, 1);
      if (assessmentData && assessmentData.length > 0) {
        const currentAssessment = assessmentData[0];
        setAssessment(currentAssessment);
        const uniqueTests = [
          ...new Set(
            currentAssessment.extracted_scores.map((s) => s.test_name)
          ),
        ];
        setAvailableTests(uniqueTests);
        if (uniqueTests.length > 0) {
          // Pre-select the first test and load its templates
          handleTestSelection(uniqueTests[0]);
        }
      }
      setIsLoading(false);
    },
    [handleTestSelection]
  ); // handleTestSelection is a dependency because it's called inside loadData.

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("assessmentId");
    if (id) {
      setAssessmentId(id);
      loadData(id);
    } else {
      setIsLoading(false);
    }
  }, [loadData]); // loadData is a dependency because it's called inside useEffect.

  const generateScoreTable = (scores, testName) => {
    let tableHtml = `
      <style>
        .score-table { border-collapse: collapse; width: 100%; font-family: sans-serif; margin-bottom: 20px; }
        .score-table th, .score-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .score-table th { background-color: #f2f2f2; }
        .score-table-caption { caption-side: top; text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 10px; }
      </style>
      <table class="score-table">
        <caption class="score-table-caption">${testName}</caption>
        <thead>
          <tr>
            <th>Subtest/Index</th>
            <th>Score</th>
            <th>Percentile Rank</th>
            <th>Descriptor</th>
          </tr>
        </thead>
        <tbody>
    `;
    scores.forEach((score) => {
      tableHtml += `
        <tr>
          <td>${score.subtest_name || ""}</td>
          <td>${score.scaled_score || score.composite_score || ""}</td>
          <td>${score.percentile_rank || ""}</td>
          <td>${score.descriptor || ""}</td>
        </tr>
      `;
    });
    tableHtml += `</tbody></table>`;
    return tableHtml;
  };

  const handleGenerateReport = async () => {
    if (!assessment || !selectedTemplateId || !selectedTest) return;

    setIsGenerating(true);
    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) {
      setIsGenerating(false);
      return;
    }

    // Filter scores for the selected test only
    const scoresForReport = assessment.extracted_scores.filter(
      (s) => s.test_name === selectedTest
    );

    // 1. Generate score table
    const scoreTableHtml = generateScoreTable(scoresForReport, selectedTest);

    // 2. Create placeholder map
    const placeholderMap = {
      "{{client_first_name}}": assessment.client_first_name,
      "{{client_last_name}}": assessment.client_last_name,
      "{{subjective_pronoun}}": assessment.subjective_pronoun,
      "{{objective_pronoun}}": assessment.objective_pronoun,
      "{{possessive_pronoun}}": assessment.possessive_pronoun,
      "{{test_name}}": selectedTest,
      "{{test_date}}": format(
        new Date(assessment.test_date || Date.now()),
        "MMMM d, yyyy"
      ),
      "{{score_table}}": scoreTableHtml,
    };
    scoresForReport.forEach((score) => {
      const name = score.subtest_name.toLowerCase().replace(/ /g, "_");
      placeholderMap[`{{${name}_score}}`] =
        score.scaled_score || score.composite_score;
      placeholderMap[`{{${name}_percentile}}`] = score.percentile_rank;
      placeholderMap[`{{${name}_descriptor}}`] = score.descriptor;
    });

    // 3. Replace placeholders in template content
    let finalContent = selectedTemplate.template_content;
    for (const [key, value] of Object.entries(placeholderMap)) {
      finalContent = finalContent.replaceAll(key, value);
    }

    // 4. Create GeneratedReport record
    try {
      const report = await GeneratedReport.create({
        assessment_id: assessment.id,
        template_id: selectedTemplate.id,
        report_content: finalContent,
        report_title: `Psychological Report for ${assessment.client_first_name} ${assessment.client_last_name}`,
        client_name: `${assessment.client_first_name} ${assessment.client_last_name}`,
      });

      // 5. Navigate to view page
      navigate(createPageUrl(`ViewReport?id=${report.id}`));
    } catch (e) {
      console.error(e);
    }

    setIsGenerating(false);
  };

  if (isLoading) {
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

        <Card
          className="border-0 shadow-lg rounded-2xl mb-6"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              {/* Fix: Added missing closing curly brace for the style prop */}
              <FileText
                className="w-5 h-5"
                style={{ color: "var(--secondary-blue)" }}
              />
              Assessment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong style={{ color: "var(--text-primary)" }}>Client:</strong>{" "}
              {assessment?.client_first_name} {assessment?.client_last_name}
            </p>
            <p>
              <strong style={{ color: "var(--text-primary)" }}>
                Test Date:
              </strong>{" "}
              {assessment?.test_date
                ? format(new Date(assessment.test_date), "MMMM d, yyyy")
                : "N/A"}
            </p>
          </CardContent>
        </Card>

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
            {availableTests.length > 1 && (
              <div className="space-y-2">
                <label className="font-medium">Select Test for Report</label>
                <Select
                  onValueChange={handleTestSelection}
                  value={selectedTest}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a test..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTests.map((test) => (
                      <SelectItem key={test} value={test}>
                        {test}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-medium">Select Template</label>
              <Select
                onValueChange={setSelectedTemplateId}
                value={selectedTemplateId}
                disabled={!selectedTest}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTest && templates.length === 0 && (
              <p
                className="text-center text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                No templates found for "{selectedTest}".
                <a
                  href={createPageUrl("Templates")}
                  className="text-blue-600 font-medium"
                >
                  {" "}
                  Create one here.
                </a>
              </p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedTemplateId || isGenerating}
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
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
