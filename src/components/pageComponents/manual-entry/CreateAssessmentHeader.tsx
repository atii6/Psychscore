import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

type Props = {
  title: string;
  description: string;
  onAction?: () => void;
  onAddAction?: () => void;
  addActionText?: string;
};

function CreateAssessmentHeader({
  title,
  description,
  onAction,
  onAddAction,
  addActionText,
}: Props) {
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

      <div className="flex-1">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">{description}</p>
      </div>
      {onAddAction && (
        <Button
          onClick={onAddAction}
          className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
          }}
        >
          <Plus className="w-5 h-5" />
          {addActionText}
        </Button>
      )}
    </div>
  );
}

export default CreateAssessmentHeader;
