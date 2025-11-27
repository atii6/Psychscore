import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomContentCard from "@/components/shared/CustomContentCard";
import ManualScoreTable from "./ManualScoreTable";
import { ClipboardEdit, PlusCircle, Trash2 } from "lucide-react";
import type { ScoresType, TestType } from "@/pages/ManualEntry";

type Props = {
  tests: TestType[];
  setTests: React.Dispatch<React.SetStateAction<TestType[]>>;
};

function ManualScoreCard({ tests, setTests }: Props) {
  const addTestGroup = () => {
    setTests((prev) => [
      ...prev,
      {
        test_name: "",
        scores: [
          {
            subtest_name: "",
            score_type: "standard",
            composite_score: 0,
            percentile_rank: 0,
            descriptor: "",
          },
        ],
      },
    ]);
  };

  const removeTestGroup = (index: number) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTestName = (index: number, name: string) => {
    setTests((prev) =>
      prev.map((test, i) => (i === index ? { ...test, test_name: name } : test))
    );
  };

  const updateScoresForTest = (index: number, newScores: ScoresType[]) => {
    setTests((prev) =>
      prev.map((test, i) =>
        i === index ? { ...test, scores: newScores } : test
      )
    );
  };
  return (
    <CustomContentCard
      title="Enter Scores"
      Icon={ClipboardEdit}
      iconProps={{
        className: "w-6 h-6",
        style: { color: "var(--secondary-blue)" },
      }}
    >
      {tests.map((test: any, index: number) => (
        <Card key={index} className="bg-gray-50/50 p-4 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Enter Test Name (e.g., WISC-V)"
              value={test.test_name}
              onChange={(e) => updateTestName(index, e.target.value)}
              className="text-lg font-semibold border-0 border-b-2 rounded-none focus:ring-0 focus:border-blue-500"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeTestGroup(index)}
              className="text-red-500 hover:text-red-600"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <ManualScoreTable
            scores={test.scores}
            onScoresChange={(newScores: any) =>
              updateScoresForTest(index, newScores)
            }
          />
        </Card>
      ))}
      <Button
        variant="outline"
        onClick={addTestGroup}
        className="w-full gap-2 border-dashed"
        type="button"
      >
        <PlusCircle className="w-4 h-4" />
        Add Another Test
      </Button>
    </CustomContentCard>
  );
}

export default ManualScoreCard;
