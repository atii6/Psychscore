import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useUpdateTestDefinition from "@/hooks/test-subtest-definitions/useUpdateTestDefinition";
import { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { Loader2, Save } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = {
  testDefinitions: TestDefinitionType[];
  changes: Record<string, boolean>;
  setChanges: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

function UnsavedChangesCard({ testDefinitions, changes, setChanges }: Props) {
  const { mutateAsync: updateTestDefinition, isPending: isSaving } =
    useUpdateTestDefinition();

  const testDefMap: Record<number, TestDefinitionType> = React.useMemo(() => {
    const map: Record<number, TestDefinitionType> = {};
    testDefinitions?.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [testDefinitions]);

  const handleSaveAll = async () => {
    try {
      for (const [defId, newValue] of Object.entries(changes)) {
        const fullObj = testDefMap[Number(defId)];

        await updateTestDefinition({
          id: Number(defId),
          testDefData: {
            ...fullObj,
            is_system_template: newValue,
          },
        });
      }

      toast.success("All changes saved successfully!");
      setChanges({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to save some changes. Please try again.");
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl mb-6 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              You have {Object.keys(changes).length} unsaved change(s)
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Click "Save Changes" to apply them
            </p>
          </div>
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default UnsavedChangesCard;
