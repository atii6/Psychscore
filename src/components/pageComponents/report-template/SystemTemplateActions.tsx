import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import { Button } from "@/components/ui/button";
import { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { createPageUrl } from "@/utils";
import { BookOpen, Copy } from "lucide-react";
import { Link } from "react-router-dom";

type Props = { template: ReportTemplateType; onCopy?: () => void };

function SystemTemplateActions({ template, onCopy }: Props) {
  return (
    <>
      <CustomAlertDialog
        trigger={
          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy & Customize</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        }
        title="Create Your Own Version?"
        description={`This will create a personal copy of "
                          ${template.template_name}" in your "My Templates" tab
                          that you can fully edit.`}
        actionButtonText="Create My Copy"
        onAction={onCopy}
      />

      <Link to={createPageUrl(`TemplateEditor?id=${template.id}`)}>
        <Button size="sm" variant="outline" className="gap-2 flex-shrink-0">
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">View Content</span>
          <span className="sm:hidden">View</span>
        </Button>
      </Link>
    </>
  );
}

export default SystemTemplateActions;
