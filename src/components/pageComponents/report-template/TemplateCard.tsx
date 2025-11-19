import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SystemTemplateActions from "./SystemTemplateActions";
import UserTemplateActions from "./UserTemplateActions";
import { Badge } from "@/components/ui/badge";

type Props = {
  template: ReportTemplateType;
  editingId: number | null;
  onCopy?: () => void;
  onEdit?: () => void;
};

function TemplateCard({ template, editingId, onCopy, onEdit }: Props) {
  return (
    <Card
      key={template.id}
      className={`border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col ${
        editingId && editingId !== template.id ? "opacity-50" : ""
      }`}
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between flex-1 mb-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--light-blue)" }}
              >
                <BookOpen
                  className="w-6 h-6"
                  style={{ color: "var(--secondary-blue)" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-lg mb-2 break-words leading-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {template.template_name}
                </h3>
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800 font-medium">
                    {template.test_type}
                  </Badge>
                  {template.is_system_template ? (
                    <Badge className="bg-gray-100 text-gray-600 font-medium">
                      System Template
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-600 font-medium">
                      User Template
                    </Badge>
                  )}
                </div>
                <p
                  className="text-sm break-words"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {template.available_placeholders?.length || 0} placeholders
                  available
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
            {template.is_system_template ? (
              <SystemTemplateActions template={template} onCopy={onCopy} />
            ) : (
              <UserTemplateActions template={template} onEdit={onEdit} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TemplateCard;
