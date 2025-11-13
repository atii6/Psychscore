import React, { useState, useEffect } from "react";
// import { ReportTemplate, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getAvailablePlaceholders } from "../components/templates/placeholderUtils";
import * as lodash from "lodash";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  BookOpen,
  FileText,
  Lock,
} from "lucide-react";

import PlaceholderPanel from "../components/templates/PlaceholderPanel";
import PreviewModal from "../components/templates/PreviewModal";

export default function TemplateEditor() {
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [templateContent, setTemplateContent] = useState("");
  const [availablePlaceholders, setAvailablePlaceholders] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [quillRef, setQuillRef] = useState(null);
  const [user, setUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setTemplateId(id);
      loadTemplateAndUser(id);
    }
  }, []);

  const loadTemplateAndUser = async (id) => {
    try {
      const [currentUser, templateData] = await Promise.all([
        User.me(),
        ReportTemplate.filter({ id }, null, 1),
      ]);

      setUser(currentUser);

      if (templateData && templateData.length > 0) {
        const tmpl = templateData[0];
        setTemplate(tmpl);
        setTemplateContent(tmpl.template_content || "");

        // Check if user can edit this template
        const userCanEdit =
          tmpl.created_by === currentUser.email ||
          (tmpl.is_system_template && currentUser.role === "admin");
        setCanEdit(userCanEdit);

        const allPlaceholders = await getAvailablePlaceholders(
          tmpl.test_type,
          tmpl.available_placeholders
        );
        setAvailablePlaceholders(allPlaceholders);
      }
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const handleSave = async () => {
    if (!template || !canEdit) {
      alert("You don't have permission to edit this template.");
      return;
    }

    setIsSaving(true);
    try {
      const customPlaceholdersToSave = availablePlaceholders.filter(
        (p) => !p.isStandard
      );

      await ReportTemplate.update(template.id, {
        template_content: templateContent,
        available_placeholders: customPlaceholdersToSave,
      });

      // Show success feedback
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      if (error.message && error.message.includes("Permission denied")) {
        alert(
          "You don't have permission to edit this template. Please create your own copy from the Templates page."
        );
      } else {
        alert("Failed to save template. Please try again.");
      }
    }
    setIsSaving(false);
  };

  const insertPlaceholder = (placeholder) => {
    if (!canEdit) return; // Don't allow inserting if can't edit

    if (quillRef) {
      const quill = quillRef.getEditor();
      const range = quill.getSelection();

      if (range) {
        quill.insertText(range.index, placeholder);
        quill.setSelection(range.index + placeholder.length);
      } else {
        const length = quill.getLength();
        quill.insertText(length - 1, placeholder);
        quill.setSelection(length + placeholder.length - 1);
      }

      quill.focus();
    }
  };

  const handleCreateCustomPlaceholder = (newPlaceholder) => {
    if (!canEdit) return; // Don't allow creating if can't edit
    setAvailablePlaceholders((prev) =>
      lodash.uniqBy([newPlaceholder, ...prev], "placeholder")
    );
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
      ["link"],
    ],
  };

  if (!template || !user) {
    return (
      <div
        className="min-h-screen p-4 md:p-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-12 text-center">
              <FileText
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <h3 className="text-xl font-semibold mb-2">
                Loading template...
              </h3>
            </CardContent>
          </Card>
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
                disabled={isSaving}
                className="gap-2 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
            )}
          </div>
        </div>

        {!canEdit && (
          <Card className="border-0 shadow-lg rounded-2xl mb-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-start gap-3">
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
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader>
                <CardTitle style={{ color: "var(--text-primary)" }}>
                  Template Content
                </CardTitle>
                <p style={{ color: "var(--text-secondary)" }}>
                  {canEdit
                    ? "Write your narrative template using placeholders for dynamic content"
                    : "View the template content"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="min-h-96">
                  <ReactQuill
                    ref={setQuillRef}
                    value={templateContent}
                    onChange={canEdit ? setTemplateContent : undefined}
                    modules={canEdit ? quillModules : { toolbar: false }}
                    theme="snow"
                    placeholder={
                      canEdit
                        ? "Start writing your report template here. Use the placeholders on the right to insert assessment data..."
                        : ""
                    }
                    style={{ minHeight: "400px" }}
                    readOnly={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder Panel */}
          <div>
            <PlaceholderPanel
              placeholders={availablePlaceholders}
              onInsertPlaceholder={canEdit ? insertPlaceholder : () => {}}
              onAddCustomPlaceholder={
                canEdit ? handleCreateCustomPlaceholder : () => {}
              }
              testType={template?.test_type}
              readOnly={!canEdit}
            />
          </div>
        </div>

        {/* Preview Modal */}
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          content={templateContent}
          templateName={template.template_name}
          placeholders={availablePlaceholders}
        />
      </div>

      <style jsx global>{`
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
