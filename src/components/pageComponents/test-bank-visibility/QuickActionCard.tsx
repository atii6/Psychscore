import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import useUpdateTestDefinition from "@/hooks/test-subtest-definitions/useUpdateTestDefinition";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

type Props = {
  testDefinitions: TestDefinitionType[];
  setChanges: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

function QuickActionCard({ testDefinitions, setChanges }: Props) {
  const { mutateAsync: updateTestDefinition, isPending: isSaving } =
    useUpdateTestDefinition();
  const handleSetAllTrue = async () => {
    if (
      !confirm(
        "Are you sure you want to make ALL test definitions visible to all users?"
      )
    ) {
      return;
    }

    try {
      for (const def of testDefinitions) {
        await updateTestDefinition({
          id: def.id,
          testDefData: { ...def, is_system_template: true },
        });
      }

      toast.success("All test definitions are now globally visible!");
      setChanges({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to update all definitions.");
    }
  };

  return (
    <Card
      className="border-0 shadow-lg rounded-2xl mb-6"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Quick Actions</CardTitle>
          <Button
            onClick={handleSetAllTrue}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Make All Global (Visible to Everyone)
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export default QuickActionCard;
