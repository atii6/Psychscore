import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { ScoresType } from "@/pages/ManualEntry";
import {
  getDescriptorAndPercentile,
  getDescriptorFromPercentile,
  getScaledScoreDescriptor,
} from "@/utilitites/helpers/common";

export default function ManualScoreTable({
  scores,
  onScoresChange,
}: {
  scores: ScoresType[];
  onScoresChange: Function;
}) {
  const [internalScores, setInternalScores] = React.useState(scores);

  React.useEffect(() => {
    onScoresChange(internalScores);
  }, [internalScores, onScoresChange]);

  const handleScoreChange = (index: number, field: string, value: string) => {
    let newScores = [...internalScores];
    let scoreToUpdate = { ...newScores[index], [field]: value };

    // Auto-calculate descriptor based on percentile rank first, then scores
    if (field === "percentile_rank") {
      const percentileValue = parseFloat(value);
      if (!isNaN(percentileValue)) {
        const descriptorInfo = getDescriptorFromPercentile(
          String(percentileValue)
        );
        scoreToUpdate.descriptor = descriptorInfo.descriptor;
      } else {
        // If percentile_rank is cleared or invalid, clear its derived descriptor
        scoreToUpdate.descriptor = "";
      }
    }
    // Only calculate from score if no percentile rank is available
    else if (field === "composite_score" || field === "score_type") {
      // Only calculate from score if the percentile_rank field is currently empty.
      // This prioritizes an existing percentile_rank value (whether manual or previously derived)
      // over re-calculating from composite_score.
      if (!scoreToUpdate.percentile_rank) {
        const scoreValue = parseFloat(scoreToUpdate.composite_score);
        if (!isNaN(scoreValue)) {
          let descriptorInfo;
          if (scoreToUpdate.score_type === "standard") {
            descriptorInfo = getDescriptorAndPercentile(scoreValue);
          } else if (scoreToUpdate.score_type === "scaled") {
            descriptorInfo = getScaledScoreDescriptor(scoreValue);
          }
          if (descriptorInfo) {
            scoreToUpdate.descriptor = descriptorInfo.descriptor;
            scoreToUpdate.percentile_rank =
              descriptorInfo.percentile.toString();
          }
        } else {
          // If composite_score is cleared or invalid AND percentile_rank was also empty,
          // clear its derived descriptor and percentile_rank.
          scoreToUpdate.descriptor = "";
          scoreToUpdate.percentile_rank = "";
        }
      }
    }

    newScores[index] = scoreToUpdate;
    setInternalScores(newScores);
  };

  const addScoreRow = () => {
    setInternalScores([
      ...internalScores,
      {
        subtest_name: "",
        score_type: "standard",
        composite_score: "",
        percentile_rank: "",
        descriptor: "",
      },
    ]);
  };

  const deleteScoreRow = (index: number) => {
    setInternalScores(internalScores.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/5">Subtest / Index</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Percentile</TableHead>
            <TableHead>Descriptor</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {internalScores.map((score, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  placeholder="e.g., Block Design"
                  value={score.subtest_name}
                  onChange={(e) =>
                    handleScoreChange(index, "subtest_name", e.target.value)
                  }
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="e.g., 12 or 115"
                  value={score.composite_score}
                  onChange={(e) =>
                    handleScoreChange(index, "composite_score", e.target.value)
                  }
                  className="h-8 w-24"
                />
              </TableCell>
              <TableCell>
                <Select
                  value={score.score_type}
                  onValueChange={(value) =>
                    handleScoreChange(index, "score_type", value)
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="scaled">Scaled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  placeholder="e.g., 75"
                  value={score.percentile_rank}
                  onChange={(e) =>
                    handleScoreChange(index, "percentile_rank", e.target.value)
                  }
                  className="h-8 w-24"
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="e.g., Above Average"
                  value={score.descriptor}
                  onChange={(e) =>
                    handleScoreChange(index, "descriptor", e.target.value)
                  }
                  className="h-8"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteScoreRow(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="outline"
        size="sm"
        onClick={addScoreRow}
        type="button"
        className="mt-4 gap-2"
      >
        <Plus className="w-4 h-4" /> Add Score
      </Button>
    </div>
  );
}
