import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { ChevronDown, ChevronRight, Database } from "lucide-react";

type Props = {
  testDefinition: TestDefinitionType;
  onToggleExpansion: () => void;
  expandedTests: Set<unknown>;
};

function TestDefinitionCardHeader({
  testDefinition,
  onToggleExpansion,
  expandedTests,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={onToggleExpansion}
      >
        {expandedTests.has(testDefinition.id) ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: "var(--light-blue)" }}
      >
        <Database
          className="w-6 h-6"
          style={{ color: "var(--secondary-blue)" }}
        />
      </div>
      <div>
        <h3
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {testDefinition.test_name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge className="bg-blue-100 text-blue-800">
            {testDefinition.subtests?.length || 0} subtests defined
          </Badge>
          {testDefinition.test_aliases?.length > 0 && (
            <Badge className="bg-gray-100 text-gray-600">
              {testDefinition.test_aliases.length} aliases
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestDefinitionCardHeader;
