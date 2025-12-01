import { Badge } from "@/components/ui/badge";
import type { SubtestType } from "@/utilitites/types/TestSubtestDefinitions";

type Props = { subtest: SubtestType };

function SubtestCard({ subtest }: Props) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium">{subtest.display_name}</span>
          <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">
            {subtest.canonical_name}
          </Badge>
          <Badge className="ml-1 bg-orange-100 text-orange-800 text-xs capitalize">
            {subtest.score_type}
          </Badge>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium">Aliases:</span>{" "}
        {(subtest.aliases || []).join(", ") || "None"}
      </div>
    </div>
  );
}

export default SubtestCard;
