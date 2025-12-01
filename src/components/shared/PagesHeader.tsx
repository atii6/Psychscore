import { Button } from "../ui/button";
import { Plus } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  actionButtonTitle?: string;
  redirectUrl?: string;
  onAction?: () => void;
};

function PagesHeader({
  title,
  description,
  actionButtonTitle,
  onAction,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">{description}</p>
      </div>
      {onAction && (
        <Button
          className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
          }}
          onClick={onAction}
        >
          <Plus className="w-5 h-5" />
          {actionButtonTitle}
        </Button>
      )}
    </div>
  );
}

export default PagesHeader;
