import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useGetAllReportTemplates from "@/hooks/report-templates/useGetAllReportTemplates";
import type { ReportTemplateType } from "@/utilitites/types/ReportTemplate";
import { TEMPLATE_CATEGORY_LABELS } from "@/utilitites/constants";
import CreateTemplateForm from "@/components/pageComponents/report-template/CreateTemplateForm";
import TemplateCard from "@/components/pageComponents/report-template/TemplateCard";
import { getAvailablePlaceholders } from "@/components/templates/placeholderUtils";
import useCreateReportTemplate from "@/hooks/report-templates/useCreateReportTemplate";

export default function TemplatesPage() {
  const { data: ReportTemplate, isLoading } = useGetAllReportTemplates();
  const { mutateAsync: createTemplate, isPending } = useCreateReportTemplate();
  const [activeTab, setActiveTab] = React.useState("system");
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const systemTempsFlat = ReportTemplate?.filter((t) => t.is_system_template);
  const userTempsFlat = ReportTemplate?.filter((t) => !t.is_system_template);

  console.log("ReportTemplate", ReportTemplate);

  const groupByCategory = (templates: ReportTemplateType[]) => {
    return templates.reduce(
      (acc: Record<string, ReportTemplateType[]>, temp) => {
        const cat = temp.category || "uncategorized";

        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(temp);

        return acc;
      },
      {}
    );
  };

  const systemTemps = groupByCategory(systemTempsFlat || []);
  const userTemps = groupByCategory(userTempsFlat || []);

  const expandedCategories = React.useMemo(
    () => new Set([...Object.keys(systemTemps), ...Object.keys(userTemps)]),
    [systemTemps, userTemps]
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
  };

  const handleOverride = async (systemTemplate: ReportTemplateType) => {
    const placeholders = await getAvailablePlaceholders(
      systemTemplate.test_type,
      systemTemplate.available_placeholders || []
    );

    const template = {
      template_name: `${systemTemplate.template_name} (My Copy)`,
      test_type: systemTemplate.test_type,
      category: systemTemplate.category,
      template_content: systemTemplate.template_content || "",
      is_system_template: false,
      available_placeholders: placeholders,
      is_active: true,
      is_sample: false,
      is_active_template: true,
    };

    await createTemplate({
      template,
    });
    setActiveTab("user");
  };

  const renderTemplateCard = (template: ReportTemplateType) => (
    <>
      {editingId === template.id ? (
        <CreateTemplateForm
          template={template}
          mainContainerStyles={`border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col ${
            editingId && editingId !== template.id ? "opacity-50" : ""
          }`}
          childContainerStyles="p-6 flex-1 flex flex-col"
          saveButtonText="Save Changes"
          resetButtonType="button"
          onReset={() => setEditingId(null)}
          isLoading={isPending}
        />
      ) : (
        <TemplateCard
          editingId={editingId}
          template={template}
          onCopy={() => handleOverride(template)}
          onEdit={() => setEditingId(template.id)}
        />
      )}
    </>
  );

  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Loading templates...
            </p>
          </div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Report Templates
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Create and manage narrative report templates
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setIsCreating(true);
                setEditingId(null);
              }}
              className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
              }}
            >
              <Plus className="w-5 h-5" />
              New Template
            </Button>
          </div>
        </div>

        {isCreating && !editingId && (
          <CreateTemplateForm onReset={() => setIsCreating(false)} />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="system" className="text-sm font-medium">
              System Templates ({systemTempsFlat?.length})
            </TabsTrigger>
            <TabsTrigger value="user" className="text-sm font-medium">
              My Templates ({userTempsFlat?.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            {systemTemps ? (
              Object.entries(systemTemps)
                .sort(([catA], [catB]) => catA.localeCompare(catB))
                .map(([category, templates]) => (
                  <Card
                    key={category}
                    className="border-0 shadow-lg rounded-2xl"
                    style={{ backgroundColor: "var(--card-background)" }}
                  >
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedCategories.has(category) ? (
                            <ChevronDown
                              className="w-5 h-5"
                              style={{ color: "var(--secondary-blue)" }}
                            />
                          ) : (
                            <ChevronRight
                              className="w-5 h-5"
                              style={{ color: "var(--secondary-blue)" }}
                            />
                          )}
                          <CardTitle
                            className="text-xl"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {TEMPLATE_CATEGORY_LABELS[
                              category as keyof typeof TEMPLATE_CATEGORY_LABELS
                            ] || category.replace("_", " ")}
                          </CardTitle>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {templates.length} template
                          {templates.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </CardHeader>
                    {true && (
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {templates.map((template) =>
                            renderTemplateCard(template)
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
            ) : (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardContent className="p-12 text-center">
                  <BookOpen
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No System Templates
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Create the first system-wide template for all users
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            {userTemps ? (
              Object.entries(userTemps)
                .sort(([catA], [catB]) => catA.localeCompare(catB))
                .map(([category, templates]) => (
                  <Card
                    key={category}
                    className="border-0 shadow-lg rounded-2xl"
                    style={{ backgroundColor: "var(--card-background)" }}
                  >
                    <CardHeader
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedCategories.has(category) ? (
                            <ChevronDown
                              className="w-5 h-5"
                              style={{ color: "var(--secondary-blue)" }}
                            />
                          ) : (
                            <ChevronRight
                              className="w-5 h-5"
                              style={{ color: "var(--secondary-blue)" }}
                            />
                          )}
                          <CardTitle
                            className="text-xl"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {TEMPLATE_CATEGORY_LABELS[
                              category as keyof typeof TEMPLATE_CATEGORY_LABELS
                            ] || category.replace("_", " ")}
                          </CardTitle>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          {templates.length} template
                          {templates.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </CardHeader>
                    {expandedCategories.has(category) && (
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {templates.map((template) =>
                            renderTemplateCard(template)
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
            ) : (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardContent className="p-12 text-center">
                  <BookOpen
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No Personal Templates
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Copy a system template or create one from scratch to get
                    started
                  </p>
                  <Button
                    onClick={() => {
                      setIsCreating(true);
                      setActiveTab("user");
                    }}
                    className="mt-4 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
