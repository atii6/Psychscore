import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import { Button } from "@/components/ui/button";
import useDeleteReportTemplate from "@/hooks/report-templates/useDeleteReportTemplate";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { createPageUrl } from "@/utils";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  template: ReportTemplateType;
  onEdit?: () => void;
};

function UserTemplateActions({ template, onEdit }: Props) {
  const { mutateAsync: deleteTemplate, isPending } = useDeleteReportTemplate();
  const handleDeleteTemplate = async (templateId: number) => {
    await deleteTemplate(templateId);
  };
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="gap-2 flex-shrink-0"
        disabled={isPending}
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">Settings</span>
      </Button>
      <CustomAlertDialog
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex-shrink-0"
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        }
        title="Delete Template?"
        description={`Are you sure you want to delete "
                          ${template.template_name}"? This action cannot be
                          undone.`}
        actionButtonText="Delete Template"
        onAction={() => handleDeleteTemplate(template.id)}
        actionButtonStyles="bg-red-600 hover:bg-red-700"
      />

      <Link to={createPageUrl(`TemplateEditor?id=${template.id}`)}>
        <Button
          size="sm"
          className="gap-2 text-white flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
          }}
          disabled={isPending}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Edit Content</span>
          <span className="sm:hidden">Edit</span>
        </Button>
      </Link>
    </>
  );
}

export default UserTemplateActions;
