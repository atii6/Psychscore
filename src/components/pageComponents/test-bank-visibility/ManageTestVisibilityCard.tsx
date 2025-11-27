import CustomContentCard from "@/components/shared/CustomContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { Loader2 } from "lucide-react";

type Props = {
  testDefinitions: TestDefinitionType[];
  isLoading: boolean;
  changes: Record<string, boolean>;
  handleToggle: (defId: number, currentValue: boolean) => void;
};

function ManageTestVisibilityCard({
  testDefinitions,
  isLoading,
  changes,
  handleToggle,
}: Props) {
  return (
    <CustomContentCard
      title={`All Test Definitions (${testDefinitions.length})`}
    >
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading test definitions...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testDefinitions.map((def) => {
            const fromState = changes[def.id];
            const currentValue =
              typeof fromState === "boolean"
                ? fromState
                : def.is_system_template;

            const hasChanged = changes.hasOwnProperty(def.id);

            return (
              <div
                key={def.id}
                className={`p-4 rounded-lg border-2 ${
                  hasChanged
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{def.test_name}</h3>
                    <p className="text-sm mt-1 text-gray-500">
                      Created by: {def.created_by || "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        currentValue
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      {currentValue ? "Global (All Users)" : "Private"}
                    </Badge>

                    <Button
                      variant={currentValue ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggle(def.id, currentValue!)}
                      className={
                        currentValue
                          ? ""
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }
                    >
                      {currentValue ? "Make Private" : "Make Global"}
                    </Button>
                  </div>
                </div>

                {hasChanged && (
                  <p className="text-xs mt-2 text-blue-600 font-medium">
                    ⚠ Unsaved change – will become{" "}
                    {currentValue ? "Global" : "Private"} when saved
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CustomContentCard>
  );
}

export default ManageTestVisibilityCard;
