import React from "react";
import { Button } from "../ui/button";
import { Eye, FileSearch, FileText, Loader2, Trash2 } from "lucide-react";
import CustomAlertDialog from "../shared/CustomAlertDialog";
import type { AssessmentType } from "@/utilitites/types/Assessment";
import useDeleteAssessment from "@/hooks/assessments/useDeleteAssessment";

type Props = {
  assessment: AssessmentType;
  hasReport?: boolean;
  onViewReport: () => void;
  onGenerateReport?: () => void;
  onViewScores?: () => void;
  isGeneratingReport?: boolean;
};

function ReportActions({
  assessment,
  hasReport,
  onViewReport,
  onGenerateReport,
  onViewScores,
  isGeneratingReport = false,
}: Props) {
  const { mutateAsync: deleteAssessment, isPending } = useDeleteAssessment();
  const handleDeleteAssessment = React.useCallback(async () => {
    await deleteAssessment(assessment.id);
  }, [deleteAssessment]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onViewScores}
        disabled={isPending || assessment.extracted_scores?.length === 0}
      >
        <Eye className="w-4 h-4" />
        View Scores
      </Button>
      {hasReport && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onViewReport}
          disabled={isPending}
        >
          <FileSearch className="w-4 h-4" />
          Quick View
        </Button>
      )}
      <CustomAlertDialog
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        }
        title="Delete Assessment?"
        description={`Are you sure you want to delete the assessment for "
              ${assessment.client_first_name} ${assessment.client_last_name}"?
              This action cannot be undone and will also delete any generated
              reports.`}
        onAction={handleDeleteAssessment}
        actionButtonText="Delete Assessment"
        actionButtonStyles="bg-red-600 hover:bg-red-700"
      />

      <Button
        size="sm"
        className="gap-2 text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
        }}
        disabled={
          !["processed", "report_generated"].includes(assessment.status) ||
          isGeneratingReport ||
          isPending
        }
        onClick={onGenerateReport}
      >
        {isGeneratingReport ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        {isGeneratingReport
          ? "Generating..."
          : assessment.status === "report_generated"
          ? "Generate Again"
          : "Generate Report"}
      </Button>
    </div>
  );
}

export default ReportActions;
