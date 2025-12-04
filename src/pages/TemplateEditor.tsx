import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ArrowLeft, Save, Eye, FileText, Lock } from "lucide-react";

import PlaceholderPanel from "../components/templates/PlaceholderPanel";
import PreviewModal from "../components/templates/PreviewModal";
import useGetReportTemplateByID from "@/hooks/report-templates/useGetReportTemplateById";
import QuillEditor from "@/components/shared/QuillEditor";
import CustomContentCard from "@/components/shared/CustomContentCard";
import type { PlaceholdersType } from "@/utilitites/types/ReportTemplate";
import { toast } from "sonner";
import useUpdateReportTemplate from "@/hooks/report-templates/useUpdateReportTemplate";
import useUserStore from "@/store/userStore";
import { USER_ROLES } from "@/utilitites/constants";

export default function TemplateEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const templateId = Number(id);
  const user = useUserStore(React.useCallback((state) => state.user, []));
  const { data: template, isLoading } = useGetReportTemplateByID(templateId);
  const { mutateAsync: updateTemplate, isPending } = useUpdateReportTemplate();
  // const [template, setTemplate] = React.useState(null);
  const templateContent = React.useMemo(
    () => template?.template_content || "",
    [template]
  );
  const [availablePlaceholders, setAvailablePlaceholders] = React.useState<
    PlaceholdersType[]
  >([]);

  const [showPreview, setShowPreview] = React.useState(false);
  const [quillRef, setQuillRef] = React.useState<ReactQuill | null>(null);
  const [newContent, setNewContent] = React.useState(templateContent);
  const canEdit =
    (template?.created_by === user?.email ||
      (template?.is_system_template && user?.role === USER_ROLES.ADMIN)) ??
    false;

  React.useMemo(() => {
    if (templateContent && !newContent) setNewContent(templateContent);
  }, [templateContent]);

  React.useMemo(() => {
    if (template?.available_placeholders)
      setAvailablePlaceholders(template.available_placeholders);
  }, [template?.available_placeholders]);

  const handleSave = async () => {
    if (!template || !canEdit) {
      toast.info("You don't have permission to edit this template.");
      return;
    }

    await updateTemplate({
      id: template.id,
      templateData: {
        ...template,
        template_content: newContent,
      },
    });
    navigate("/templates");
  };

  const insertPlaceholder = (placeholder: string) => {
    if (!canEdit) return;

    if (quillRef) {
      const quill = quillRef.getEditor();
      const range = quill.getSelection(true);

      if (range) {
        quill.insertText(range.index, placeholder, "user");
        quill.setSelection(range.index + placeholder.length, 0, "user");
      } else {
        const length = quill.getLength();
        quill.insertText(length - 1, placeholder, "user");
        quill.setSelection(length - 1 + placeholder.length, 0, "user");
      }

      quill.focus();
    }
  };

  if (!template || isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="max-w-4xl mx-auto">
          <CustomContentCard contentContainerStyles="text-center">
            <FileText
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: "var(--text-secondary)" }}
            />
            <h3 className="text-xl font-semibold mb-2">Loading template...</h3>
          </CustomContentCard>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Templates"))}
            className="rounded-xl border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {canEdit ? "Edit" : "View"} Template: {template.template_name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                {template.test_type}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                {template.category}
              </Badge>
              {!canEdit && (
                <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Read-Only
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="gap-2 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
              >
                <Save className="w-4 h-4" />
                {isPending ? "Saving..." : "Save Template"}
              </Button>
            )}
          </div>
        </div>

        {!canEdit && (
          <CustomContentCard
            cardStyles="mb-6 bg-yellow-50 border-yellow-200"
            contentContainerStyles="p-4 flex items-start gap-3"
          >
            <Lock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                This template is read-only
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {template.is_system_template
                  ? "To customize this system template, go back to Templates and click 'Copy & Customize' to create your own editable version."
                  : "You don't have permission to edit this template. Only the creator can make changes."}
              </p>
              <Button
                onClick={() => navigate(createPageUrl("Templates"))}
                variant="outline"
                size="sm"
                className="mt-3 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                Go to Templates Page
              </Button>
            </div>
          </CustomContentCard>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <CustomContentCard
              title="Template Content"
              description={
                canEdit
                  ? "Write your narrative template using placeholders for dynamic content"
                  : "View the template content"
              }
            >
              {/* {templateContent && ( */}
              <div className="min-h-96">
                <QuillEditor
                  setQuillRef={setQuillRef}
                  value={newContent}
                  onChange={canEdit ? setNewContent : undefined}
                  canEdit={canEdit}
                  placeholder={
                    canEdit
                      ? "Start writing your report template here. Use the placeholders on the right to insert assessment data..."
                      : ""
                  }
                  readOnly={!canEdit}
                />
              </div>
              {/* )} */}
            </CustomContentCard>
          </div>

          {/* Placeholder Panel */}
          <div>
            <PlaceholderPanel
              placeholders={availablePlaceholders}
              onInsertPlaceholder={canEdit ? insertPlaceholder : () => {}}
              testType={template?.test_type}
              readOnly={!canEdit}
            />
          </div>
        </div>

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          content={newContent}
          templateName={template.template_name}
          placeholders={availablePlaceholders}
        />
      </div>

      <style>{`
        .ql-editor {
          min-height: 400px;
          max-height: 400px;
          overflow-y: auto;
          font-size: 16px;
          line-height: 1.6;
          padding: 12px 15px;
        }
        .ql-container {
          border-bottom: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-radius: 0 0 0.75rem 0.75rem;
          height: 400px;
        }
        .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-radius: 0.75rem 0.75rem 0 0;
        }
        ${!canEdit ? ".ql-toolbar { display: none; }" : ""}
        ${!canEdit ? ".ql-editor { cursor: default; }" : ""}
      `}</style>
    </div>
  );
}
