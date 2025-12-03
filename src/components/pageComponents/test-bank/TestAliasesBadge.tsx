import { Badge } from "@/components/ui/badge";

type Props = { testAliases: string[] };

function TestAliasesBadge({ testAliases }: Props) {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">Test Aliases:</h4>
      <div className="flex flex-wrap gap-2">
        {testAliases.map((alias, idx) => (
          <Badge key={idx} variant="outline" className="rounded-full">
            {alias}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default TestAliasesBadge;
