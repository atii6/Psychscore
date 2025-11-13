import React, { useState, useEffect } from "react";
// import { ReportTemplate } from "@/api/entities";
// import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Edit,
  Save,
  X,
  FileText,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getAvailablePlaceholders } from "../components/templates/placeholderUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as lodash from "lodash";

const categoryLabels = {
  cognitive: "Cognitive Assessments",
  personality: "Personality Assessments",
  behavioral: "Behavioral Assessments",
  achievement: "Achievement Assessments",
  neuropsychological: "Neuropsychological Assessments",
  "self-report": "Self-Report Measures",
};

export default function TemplatesPage() {
  const [systemTemplates, setSystemTemplates] = useState({});
  const [myTemplates, setMyTemplates] = useState({});
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("system");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [formData, setFormData] = useState({
    template_name: "",
    test_type: "",
    category: "cognitive",
  });

  useEffect(() => {
    loadUserAndTemplates();
  }, []);

  const loadUserAndTemplates = async () => {
    try {
      setIsLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);

      // Fetch ALL templates (RLS now allows everyone to read all)
      const allTemplates = await ReportTemplate.list();

      console.log("All templates fetched:", allTemplates.length);
      console.log(
        "Template details:",
        allTemplates.map((t) => ({
          name: t.template_name,
          is_system: t.is_system_template,
          created_by: t.created_by,
        }))
      );

      // Filter system templates (is_system_template === true)
      const systemTemps = allTemplates.filter(
        (t) => t.is_system_template === true
      );

      // Filter user templates (is_system_template === false AND created by current user)
      const userTemps = allTemplates.filter(
        (t) =>
          t.is_system_template === false && t.created_by === currentUser.email
      );

      console.log("System templates found:", systemTemps.length);
      console.log("User templates found:", userTemps.length);

      // Group and sort system templates by category
      const groupedSystemTemplates = lodash.groupBy(systemTemps, "category");
      for (const category in groupedSystemTemplates) {
        groupedSystemTemplates[category].sort((a, b) =>
          a.template_name.localeCompare(b.template_name)
        );
      }

      // Group and sort user templates by category
      const groupedUserTemplates = lodash.groupBy(userTemps, "category");
      for (const category in groupedUserTemplates) {
        groupedUserTemplates[category].sort((a, b) =>
          a.template_name.localeCompare(b.template_name)
        );
      }

      setSystemTemplates(groupedSystemTemplates);
      setMyTemplates(groupedUserTemplates);

      // Expand all categories by default
      const allCategories = new Set([
        ...Object.keys(groupedSystemTemplates),
        ...Object.keys(groupedUserTemplates),
      ]);
      setExpandedCategories(allCategories);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSave = async () => {
    const isSystem = user?.role === "admin" && !editingId;

    if (editingId) {
      await ReportTemplate.update(editingId, formData);
    } else {
      const placeholders = await getAvailablePlaceholders(formData.test_type);
      const newTemplate = await ReportTemplate.create({
        ...formData,
        template_content: "",
        is_system_template: isSystem,
        available_placeholders: placeholders,
      });
      window.location.href = createPageUrl(
        `TemplateEditor?id=${newTemplate.id}`
      );
      return;
    }

    setFormData({ template_name: "", test_type: "", category: "cognitive" });
    setIsCreating(false);
    setEditingId(null);
    loadUserAndTemplates();
  };

  const handleDelete = async (templateId) => {
    await ReportTemplate.delete(templateId);
    loadUserAndTemplates();
  };

  const handleOverride = async (systemTemplate) => {
    const placeholders = await getAvailablePlaceholders(
      systemTemplate.test_type,
      systemTemplate.available_placeholders
    );
    await ReportTemplate.create({
      template_name: `${systemTemplate.template_name} (My Copy)`,
      test_type: systemTemplate.test_type,
      category: systemTemplate.category,
      template_content: systemTemplate.template_content || "",
      is_system_template: false,
      available_placeholders: placeholders,
    });

    loadUserAndTemplates();
    setActiveTab("user");
  };

  const handleEdit = (template) => {
    setFormData({
      template_name: template.template_name,
      test_type: template.test_type,
      category: template.category,
    });
    setEditingId(template.id);
  };

  const handleCancel = () => {
    setFormData({ template_name: "", test_type: "", category: "cognitive" });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleInlineSave = async (templateId) => {
    await ReportTemplate.update(templateId, formData);
    setFormData({ template_name: "", test_type: "", category: "cognitive" });
    setEditingId(null);
    loadUserAndTemplates();
  };

  const renderTemplateCard = (template) => (
    <Card
      key={template.id}
      className={`border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col ${
        editingId && editingId !== template.id ? "opacity-50" : ""
      }`}
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        {editingId === template.id ? (
          <div className="space-y-4 flex-1 flex flex-col">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Template Name
              </label>
              <Input
                value={formData.template_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    template_name: e.target.value,
                  }))
                }
                placeholder="e.g., My WISC-V Cognitive Report"
                className="rounded-lg border-2"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Test Type
                </label>
                <Input
                  value={formData.test_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      test_type: e.target.value,
                    }))
                  }
                  placeholder="e.g., WISC-V, WAIS-IV, WJ-IV"
                  className="rounded-lg border-2"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200"
                >
                  <option value="cognitive">Cognitive</option>
                  <option value="personality">Personality</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="achievement">Achievement</option>
                  <option value="neuropsychological">Neuropsychological</option>
                  <option value="self-report">Self-Report</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-auto pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={() => handleInlineSave(template.id)}
                className="text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
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
              {template.is_system_template && user?.role !== "admin" ? (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          Copy & Customize
                        </span>
                        <span className="sm:hidden">Copy</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      style={{ backgroundColor: "var(--card-background)" }}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Create Your Own Version?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will create a personal copy of "
                          {template.template_name}" in your "My Templates" tab
                          that you can fully edit.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleOverride(template)}
                        >
                          Create My Copy
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Link to={createPageUrl(`TemplateEditor?id=${template.id}`)}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 flex-shrink-0"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">View Content</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="gap-2 flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      style={{ backgroundColor: "var(--card-background)" }}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "
                          {template.template_name}"? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Template
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Link to={createPageUrl(`TemplateEditor?id=${template.id}`)}>
                    <Button
                      size="sm"
                      className="gap-2 text-white flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Content</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const systemTemplateCount = Object.values(systemTemplates).flat().length;
  const myTemplateCount = Object.values(myTemplates).flat().length;

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
                setActiveTab(user?.role === "admin" ? "system" : "user");
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
          <Card
            className="border-0 shadow-lg rounded-2xl mb-6"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <CardHeader>
              <CardTitle style={{ color: "var(--text-primary)" }}>
                Create New Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Template Name
                  </label>
                  <Input
                    value={formData.template_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        template_name: e.target.value,
                      }))
                    }
                    placeholder="e.g., My WISC-V Cognitive Report"
                    className="rounded-lg border-2"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Test Type
                  </label>
                  <Input
                    value={formData.test_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        test_type: e.target.value,
                      }))
                    }
                    placeholder="e.g., WISC-V, WAIS-IV, WJ-IV"
                    className="rounded-lg border-2"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200"
                >
                  <option value="cognitive">Cognitive</option>
                  <option value="personality">Personality</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="achievement">Achievement</option>
                  <option value="neuropsychological">Neuropsychological</option>
                  <option value="self-report">Self-Report</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create & Edit Content
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="system" className="text-sm font-medium">
              System Templates ({systemTemplateCount})
            </TabsTrigger>
            <TabsTrigger value="user" className="text-sm font-medium">
              My Templates ({myTemplateCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            {systemTemplateCount > 0 ? (
              Object.entries(systemTemplates)
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
                            {categoryLabels[category] ||
                              category.replace("_", " ")}
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
            {myTemplateCount > 0 ? (
              Object.entries(myTemplates)
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
                            {categoryLabels[category] ||
                              category.replace("_", " ")}
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
