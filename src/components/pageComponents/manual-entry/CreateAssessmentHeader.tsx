import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = { title: string; description: string; onAction?: () => void };

function CreateAssessmentHeader({ title, description, onAction }: Props) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {onAction && (
        <Button
          variant="outline"
          size="icon"
          onClick={onAction}
          className="rounded-xl border-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
      )}

      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}

export default CreateAssessmentHeader;
