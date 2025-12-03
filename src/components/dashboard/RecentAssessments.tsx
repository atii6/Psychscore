import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  FileText,
  Eye,
  MoreHorizontal,
  Trash2,
  FileCheck,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AssessmentType } from "@/utilitites/types/Assessment";
import { GeneratedReport } from "@/utilitites/types/GeneratedReports";
import useDeleteAssessment from "@/hooks/assessments/useDeleteAssessment";
import useDeleteGeneratedReport from "@/hooks/generated-reports/useDeleteGeneratedReport";
import useGetAllGeneratedReports from "@/hooks/generated-reports/useGetAllGeneratedReports";
import { toast } from "sonner";
// import { Assessment } from "@/api/entities";
// import { GeneratedReport } from "@/api/entities";

const statusColors = {
  uploaded: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processed: "bg-blue-100 text-blue-800 border-blue-200",
  report_generated: "bg-green-100 text-green-800 border-green-200",
};

type RecentAssessmentsProps = {
  assessments: AssessmentType[];
  isLoading: boolean;
  onGenerateReport?: (assessment: AssessmentType) => void;
  generatedReports?: GeneratedReport[];
};

export default function RecentAssessments({
  assessments = [],
  isLoading,
  onGenerateReport,
  generatedReports,
}: RecentAssessmentsProps) {
  const { mutateAsync: deleteAssessment } = useDeleteAssessment();
  const { mutateAsync: deleteGeneratedReport } = useDeleteGeneratedReport();
  const { data: GeneratedReport } = useGetAllGeneratedReports();
  const handleDeleteAssessment = async (assessmentId: number) => {
    try {
      const reports =
        GeneratedReport?.filter(
          (report) => report.assessment_id === assessmentId
        ) || [];
      for (const report of reports) {
        await deleteGeneratedReport(report.id);
      }
      await deleteAssessment(assessmentId);
    } catch (error) {
      console.error("Failed to delete assessment:", error);
    }
  };

  const handleViewReport = async (assessmentId: number) => {
    try {
      const reports = generatedReports?.filter(
        (r) => r.assessment_id === assessmentId
      );
      if (reports && reports.length > 0) {
        window.open(
          createPageUrl(`ViewReport?id=${reports[0].assessment_id}`),
          "_blank"
        );
      } else {
        toast.info("No report found for this assessment.");
      }
    } catch (error) {
      console.error("Failed to find report:", error);
    }
  };

  const handleGenerateReportClick = async (assessment: AssessmentType) => {
    if (onGenerateReport) {
      try {
        onGenerateReport(assessment);
      } catch (error) {
        console.error("Failed to generate report:", error);
        toast.error("Failed to generate report. Please try again.");
      }
    } else {
      console.error("onGenerateReport callback not provided");
      toast.info(
        "Report generation is not properly configured. Please refresh the page and try again."
      );
    }
  };

  if (isLoading) {
    return (
      <Card
        className="border-0 shadow-lg rounded-2xl"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--text-primary)" }}>
            Recent Assessments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-0 shadow-lg rounded-2xl"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle style={{ color: "var(--text-primary)" }}>
            Recent Assessments
          </CardTitle>
          <Link to={createPageUrl("Reports")}>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessments.length === 0 ? (
          <div className="text-center py-8">
            <FileText
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--text-secondary)" }}
            />
            <p
              className="text-lg font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No assessments yet
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              Upload your first assessment to get started
            </p>
          </div>
        ) : (
          assessments.slice(0, 5).map((assessment) => {
            const testNames = [
              ...new Set(
                assessment.extracted_scores?.map(
                  (s: Record<string, any>) => s.test_name
                ) || []
              ),
            ].join(", ");
            return (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--light-blue)" }}
                  >
                    <FileText
                      className="w-5 h-5"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {assessment.client_first_name}{" "}
                      {assessment.client_last_name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {testNames} •{" "}
                      {format(
                        new Date(assessment.created_date || ""),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${
                      statusColors[assessment.status]
                    } border font-medium`}
                  >
                    {assessment.status.replace("_", " ")}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(createPageUrl("Reports"), "_blank")
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Scores
                      </DropdownMenuItem>

                      {assessment.status === "processed" && (
                        <DropdownMenuItem
                          onClick={() => handleGenerateReportClick(assessment)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                      )}

                      {assessment.status === "report_generated" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleViewReport(assessment.id || 0)}
                          >
                            <FileCheck className="w-4 h-4 mr-2" />
                            View Report
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleGenerateReportClick(assessment)
                            }
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Generate Again
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Assessment
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          style={{ backgroundColor: "var(--card-background)" }}
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Assessment?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the assessment for
                              &quot;{assessment.client_first_name}{" "}
                              {assessment.client_last_name}&quot;? This will
                              also delete any generated reports and cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteAssessment(assessment.id || 0)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Assessment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
