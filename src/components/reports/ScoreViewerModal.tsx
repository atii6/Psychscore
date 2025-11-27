import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type {
  AssessmentType,
  ExtractedScore,
} from "@/utilitites/types/Assessment";
import { getDescriptorColor } from "@/utilitites/helpers/common";

type ScoreViewerModalProps = {
  assessment: AssessmentType | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function ScoreViewerModal({
  assessment,
  isOpen,
  onClose,
}: ScoreViewerModalProps) {
  if (!assessment) return null;

  const groupedScores: Record<string, ExtractedScore[]> =
    assessment.extracted_scores?.reduce<Record<string, ExtractedScore[]>>(
      (acc, score) => {
        const key = score.test_name ?? "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(score);
        return acc;
      },
      {}
    ) || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle>
            Scores for {assessment.client_first_name}{" "}
            {assessment.client_last_name}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
          {Object.entries(groupedScores).map(([testName, scores]) => (
            <div key={testName}>
              <h3 className="font-semibold text-lg mb-2">{testName}</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">
                        Subtest/Index
                      </TableHead>
                      <TableHead className="font-semibold">Score</TableHead>
                      <TableHead className="font-semibold">
                        Percentile
                      </TableHead>
                      <TableHead className="font-semibold">
                        Descriptor
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scores.map((score, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {score.subtest_name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {score.scaled_score || score.composite_score}
                        </TableCell>
                        <TableCell>{score.percentile_rank}%</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-medium ${getDescriptorColor(
                              score.descriptor || ""
                            )}`}
                          >
                            {score.descriptor}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
