import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Search } from "lucide-react";
import ScoreViewerModal from "../components/reports/ScoreViewerModal";
import QuickViewReportModal from "../components/reports/QuickViewReportModal";
import useGetAllGeneratedReports from "@/hooks/generated-reports/useGetAllGeneratedReports";
import useGetAllAssessments from "@/hooks/assessments/useGetAllAssessments";
import type { AssessmentType } from "@/utilitites/types/Assessment";
import type { GeneratedReport } from "@/utilitites/types/GeneratedReports";
import AssessmentReportCards from "@/components/reports/AssessmentReportCards";
import PagesHeader from "@/components/shared/PagesHeader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [viewingScores, setViewingScores] =
    React.useState<AssessmentType | null>(null);
  const [quickViewReport, setQuickViewReport] =
    React.useState<GeneratedReport | null>(null);
  const { data: GeneratedReport, isLoading: isLoadingGeneratedReports } =
    useGetAllGeneratedReports();
  const { data: Assessment, isLoading: isLoadingAssessments } =
    useGetAllAssessments();

  const reportCounts = React.useMemo(() => {
    if (!GeneratedReport) return {};

    return GeneratedReport.reduce((acc, report) => {
      acc[report.assessment_id] = (acc[report.assessment_id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }, [GeneratedReport]);

  const isLoading = isLoadingAssessments || isLoadingGeneratedReports;

  const filteredAssessments = React.useMemo(
    () =>
      Assessment?.filter((assessment) => {
        const clientFullName = `${assessment.client_first_name || ""} ${
          assessment.client_last_name || ""
        }`;
        const testNames = [
          ...new Set(
            assessment.extracted_scores?.map((s) => s.test_name) || []
          ),
        ].join(", ");
        const matchesSearch =
          clientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testNames.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || assessment.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [Assessment, searchTerm, statusFilter]
  );

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto">
        <PagesHeader
          title="Assessment Reports"
          description="Generate and manage psychological assessment reports"
        />

        <Card
          className="border-0 shadow-lg rounded-2xl mb-6"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-3 w-4 h-4"
                  style={{ color: "var(--text-secondary)" }}
                />
                <Input
                  placeholder="Search by client name or test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 rounded-lg border-2"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200"
                name="status"
              >
                <option value="all">All Status</option>
                <option value="processed">Ready for Report</option>
                <option value="report_generated">Report Generated</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredAssessments?.map((assessment) => {
            return (
              <AssessmentReportCards
                key={assessment.id}
                assessment={assessment}
                reportCounts={reportCounts}
                setQuickViewReport={setQuickViewReport}
                GeneratedReport={GeneratedReport}
                setViewingScores={setViewingScores}
              />
            );
          })}

          {filteredAssessments?.length === 0 && !isLoading && (
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardContent className="p-12 text-center">
                <FileText
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: "var(--text-secondary)" }}
                />
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No assessments found
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  Upload your first assessment to start generating reports
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <ScoreViewerModal
          assessment={viewingScores}
          isOpen={!!viewingScores}
          onClose={() => setViewingScores(null)}
        />
        <QuickViewReportModal
          report={quickViewReport}
          isOpen={!!quickViewReport}
          onClose={() => setQuickViewReport(null)}
        />
      </div>
    </div>
  );
}
