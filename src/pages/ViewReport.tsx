import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import useGetGenratedReportByID from "@/hooks/generated-reports/useGetGeneratedReportById";
import CreateAssessmentHeader from "@/components/pageComponents/manual-entry/CreateAssessmentHeader";
import ReportDownloadButton from "@/components/pageComponents/view-report/ReportDownloadButton";
import ReportExpirationCard from "@/components/pageComponents/view-report/ReportExpirationCard";
import ReportNotFoundCard from "@/components/pageComponents/view-report/ReportNotFoundCard";

export default function ViewReportPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const reportId = Number(id);
  const navigate = useNavigate();
  const { data: GeneratedReport, isLoading: isLoadingReport } =
    useGetGenratedReportByID(reportId);

  const reportData = React.useMemo(() => {
    return GeneratedReport;
  }, [GeneratedReport]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const isExpired = new Date(reportData?.created_date || "") < thirtyDaysAgo;

  if (isLoadingReport) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2
          className="w-12 h-12 animate-spin"
          style={{ color: "var(--primary-blue)" }}
        />
      </div>
    );
  }

  // New conditional rendering for expired reports
  if (isExpired) {
    return <ReportExpirationCard />;
  }

  if (!reportData) {
    return <ReportNotFoundCard />;
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <CreateAssessmentHeader
            title={reportData.report_title || ""}
            description={`Generated on
                ${format(
                  new Date(reportData.created_date || ""),
                  "MMMM d, yyyy"
                )}`}
            onAction={() => navigate(createPageUrl("Reports"))}
          />

          <ReportDownloadButton reportData={reportData} />
        </div>

        <Card
          className="border-0 shadow-lg rounded-2xl"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none p-4 border rounded-lg bg-white"
              dangerouslySetInnerHTML={{ __html: reportData.report_content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
