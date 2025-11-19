import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import type { PlaceholdersType } from "@/utilitites/types/ReportTemplate";

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  templateName: string;
  placeholders: PlaceholdersType[];
};

export default function PreviewModal({
  isOpen,
  onClose,
  content,
  templateName,
  placeholders,
}: PreviewModalProps) {
  const originalContent = placeholders.reduce<Record<string, string>>(
    (acc, p) => {
      acc[p.placeholder] = p.description;
      return acc;
    },
    {}
  );

  const replaceContent = (text: string) => {
    let replacedText = text;
    Object.entries(originalContent).forEach(([placeholder, value]) => {
      const regex = new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g");
      replacedText = replacedText.replace(
        regex,
        `<span class="bg-yellow-200 px-1 rounded font-semibold">${value}</span>`
      );
    });
    return replacedText;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[var(--card-background)]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview: {templateName}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Preview Note:</strong> This shows how your template will
              look with sample data. Highlighted values show where placeholders
              will be replaced with actual assessment data.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: replaceContent(
                  content || "No content yet. Start writing your template!"
                ),
              }}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Active Placeholders:</h4>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((p, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {p.placeholder}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
