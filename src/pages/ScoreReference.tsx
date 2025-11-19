import * as React from "react";
// import { UserScoreDescriptor } from "@/api/entities";
// import { ReportTemplate } from "@/api/entities"; // Keep import for User.me to access currentUser
// import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Plus, Edit, Save, X, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, HelpCircle } from "lucide-react";

export default function ScoreDescriptorsPage() {
  const [myDescriptors] = React.useState([]);
  // availableTests state is no longer needed as custom descriptors are not test-specific
  // const [availableTests, setAvailableTests] = useState([]);
  // const [user, setUser] = React.useState(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    // test_name removed
    score_type: "standard",
    min_score: "",
    max_score: "",
    descriptor: "",
    percentile_range: "",
    clinical_interpretation: "",
  });
  const [useAiDescriptors, setUseAiDescriptors] = React.useState(false);
  const [isSavingPreference, setIsSavingPreference] = React.useState(false);

  // const loadUserAndData = async () => {
  //   const currentUser = await User.me();
  //   // setUser(currentUser);
  //   setUseAiDescriptors(currentUser.use_ai_descriptors || false);

  //   // Load user's custom descriptors
  //   // Changed filter and sort criteria to score_type and min_score
  //   const descriptors = await UserScoreDescriptor.filter(
  //     { created_by: currentUser.email },
  //     "min_score"
  //   );
  //   setMyDescriptors(descriptors);

  //   // No need to load available tests anymore since we're not doing test-specific descriptors
  //   // const templates = await ReportTemplate.list();
  //   // const uniqueTests = [...new Set(templates.map(t => t.test_type))].sort();
  //   // setAvailableTests(uniqueTests);
  // };

  // React.useEffect(() => {
  //   loadUserAndData();
  // }, []);

  const handleSavePreference = async () => {
    setIsSavingPreference(true);
    // await User.updateMyUserData({ use_ai_descriptors: useAiDescriptors });
    setIsSavingPreference(false);
    // You can add a toast notification here for user feedback
  };

  const handleSave = async () => {
    // const dataToSave = {
    //   ...formData,
    //   min_score: parseFloat(formData.min_score),
    //   max_score: parseFloat(formData.max_score),
    // };

    if (editingId) {
      // await UserScoreDescriptor.update(editingId, dataToSave);
    } else {
      // await UserScoreDescriptor.create(dataToSave);
    }

    setFormData({
      // test_name removed
      score_type: "standard",
      min_score: "",
      max_score: "",
      descriptor: "",
      percentile_range: "",
      clinical_interpretation: "",
    });
    setIsCreating(false);
    setEditingId(null);
    // loadUserAndData();
  };

  // const handleDelete = async () => {
  //   // await UserScoreDescriptor.delete(descriptorId);
  //   // loadUserAndData();
  // };

  const handleEdit = (descriptor) => {
    setFormData({
      // test_name removed
      score_type: descriptor.score_type,
      min_score: descriptor.min_score.toString(),
      max_score: descriptor.max_score.toString(),
      descriptor: descriptor.descriptor,
      percentile_range: descriptor.percentile_range || "",
      clinical_interpretation: descriptor.clinical_interpretation || "",
    });
    setEditingId(descriptor.id);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setFormData({
      // test_name removed
      score_type: "standard",
      min_score: "",
      max_score: "",
      descriptor: "",
      percentile_range: "",
      clinical_interpretation: "",
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const getScoreTypeColor = (type) => {
    const colors = {
      standard: "bg-blue-100 text-blue-800",
      scaled: "bg-green-100 text-green-800",
      // composite and percentile types are no longer explicitly managed for custom descriptors in this structure
      // composite: "bg-purple-100 text-purple-800",
      // percentile: "bg-orange-100 text-orange-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Clinical scoring reference data
  const clinicalScoringTable = {
    title: "Standard Score Interpretations",
    subtitle: "Official Clinical Descriptors for Psychological Assessments",
    ranges: [
      {
        standardScore: "130+",
        percentile: "98-99",
        descriptor: "Extremely High",
        color: "purple",
        description: "Performance well above the normal range",
      },
      {
        standardScore: "120-129",
        percentile: "91-97",
        descriptor: "Very High",
        color: "indigo",
        description: "Performance significantly above average",
      },
      {
        standardScore: "110-119",
        percentile: "75-90",
        descriptor: "Above Average",
        color: "green",
        description: "Performance above average range",
      },
      {
        standardScore: "90-109",
        percentile: "25-74",
        descriptor: "Average",
        color: "blue",
        description: "Performance within normal limits",
      },
      {
        standardScore: "80-89",
        percentile: "9-24",
        descriptor: "Below Average",
        color: "yellow",
        description: "Performance below average but within normal variation",
      },
      {
        standardScore: "70-79",
        percentile: "3-8",
        descriptor: "Very Low",
        color: "orange",
        description: "Performance significantly below average",
      },
      {
        standardScore: "69 & below",
        percentile: "1-2",
        descriptor: "Extremely Low",
        color: "red",
        description: "Performance well below the normal range",
      },
    ],
  };

  const scaledScoreReference = {
    title: "Scaled Score Reference",
    subtitle: "Subtest Score Interpretations (Mean = 10, SD = 3)",
    ranges: [
      {
        scaledScore: "17-19",
        descriptor: "Extremely High",
        color: "purple",
        percentile: "98-99",
      },
      {
        scaledScore: "15-16",
        descriptor: "Very High",
        color: "indigo",
        percentile: "91-97",
      },
      {
        scaledScore: "12-14",
        descriptor: "Above Average",
        color: "green",
        percentile: "75-90",
      },
      {
        scaledScore: "8-11",
        descriptor: "Average",
        color: "blue",
        percentile: "25-74",
      },
      {
        scaledScore: "6-7",
        descriptor: "Below Average",
        color: "yellow",
        percentile: "9-24",
      },
      {
        scaledScore: "4-5",
        descriptor: "Very Low",
        color: "orange",
        percentile: "3-8",
      },
      {
        scaledScore: "1-3",
        descriptor: "Extremely Low",
        color: "red",
        percentile: "1-2",
      },
    ],
  };

  const colorClasses = {
    red: "bg-red-100 text-red-800 border-red-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
  };

  // Group custom descriptors by score type and sort them
  const standardDescriptors = myDescriptors
    .filter((d) => d.score_type === "standard")
    .sort((a, b) => a.min_score - b.min_score);
  const scaledDescriptors = myDescriptors
    .filter((d) => d.score_type === "scaled")
    .sort((a, b) => a.min_score - b.min_score);

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Score Descriptors
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage standard and custom descriptive terms for psychological
              assessments
            </p>
          </div>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system" className="text-sm font-medium">
              System Descriptors
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-sm font-medium">
              My Descriptors ({myDescriptors.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            {/* Standard Score Table */}
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <BarChart3
                    className="w-6 h-6"
                    style={{ color: "var(--secondary-blue)" }}
                  />
                  {clinicalScoringTable.title}
                </CardTitle>
                <p style={{ color: "var(--text-secondary)" }}>
                  {clinicalScoringTable.subtitle}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Standard Score
                        </th>
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Percentile
                        </th>
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Descriptive Term
                        </th>
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Clinical Interpretation
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicalScoringTable.ranges.map((range, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td
                            className="py-3 px-4 font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {range.standardScore}
                          </td>
                          <td
                            className="py-3 px-4"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {range.percentile}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${
                                colorClasses[range.color]
                              } border font-medium`}
                            >
                              {range.descriptor}
                            </Badge>
                          </td>
                          <td
                            className="py-3 px-4 text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {range.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Scaled Score Table */}
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <BarChart3
                    className="w-6 h-6"
                    style={{ color: "var(--secondary-blue)" }}
                  />
                  {scaledScoreReference.title}
                </CardTitle>
                <p style={{ color: "var(--text-secondary)" }}>
                  {scaledScoreReference.subtitle}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Scaled Score Range
                        </th>
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Percentile
                        </th>
                        <th
                          className="text-left py-3 px-4 font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Descriptive Term
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scaledScoreReference.ranges.map((range, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td
                            className="py-3 px-4 font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {range.scaledScore}
                          </td>
                          <td
                            className="py-3 px-4"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {range.percentile}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${
                                colorClasses[range.color]
                              } border font-medium`}
                            >
                              {range.descriptor}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Footer Note */}
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Clinical Usage Note
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    These descriptive terms follow standard clinical psychology
                    conventions. Standard scores have a mean of 100 and standard
                    deviation of 15. Scaled scores have a mean of 10 and
                    standard deviation of 3. Always refer to the specific test
                    manual for complete interpretive guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            {/* AI Descriptor Preference Card */}
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--light-blue)" }}
                  >
                    <Brain
                      className="w-5 h-5"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Descriptor Preference
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Choose the source for automatic descriptors
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <Label
                      htmlFor="use-ai-descriptors"
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Test Specific Descriptors
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Test specific descriptors that are extracted during
                            the upload process
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="use-ai-descriptors"
                      checked={useAiDescriptors}
                      onCheckedChange={setUseAiDescriptors}
                    />
                    <Label
                      htmlFor="use-ai-descriptors"
                      className={`font-medium transition-colors duration-200 ${
                        useAiDescriptors ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {useAiDescriptors ? "On" : "Off"}
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSavePreference}
                    disabled={isSavingPreference}
                    className="text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingPreference ? "Saving..." : "Save Preference"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Add Button removed from here */}

            {/* Create/Edit Form */}
            {isCreating && (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardHeader>
                  <CardTitle style={{ color: "var(--text-primary)" }}>
                    {editingId
                      ? "Edit Custom Descriptor"
                      : "Add New Custom Descriptor"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Test Name selection removed */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Score Type
                    </label>
                    <Select
                      value={formData.score_type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, score_type: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select score type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Score</SelectItem>
                        <SelectItem value="scaled">Scaled Score</SelectItem>
                        {/* Composite and Percentile types removed from custom creation, they are more nuanced */}
                        {/* <SelectItem value="composite">Composite Score</SelectItem>
                        <SelectItem value="percentile">Percentile</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Min Score
                      </label>
                      <Input
                        type="number"
                        value={formData.min_score}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            min_score: e.target.value,
                          }))
                        }
                        placeholder="70"
                        className="rounded-lg border-2"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Max Score
                      </label>
                      <Input
                        type="number"
                        value={formData.max_score}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            max_score: e.target.value,
                          }))
                        }
                        placeholder="79"
                        className="rounded-lg border-2"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Percentile Range
                      </label>
                      <Input
                        value={formData.percentile_range}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            percentile_range: e.target.value,
                          }))
                        }
                        placeholder="3-8"
                        className="rounded-lg border-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Custom Descriptor
                    </label>
                    <Input
                      value={formData.descriptor}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          descriptor: e.target.value,
                        }))
                      }
                      placeholder="e.g., Significantly Below Average, Borderline"
                      className="rounded-lg border-2"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Clinical Interpretation (Optional)
                    </label>
                    <Textarea
                      value={formData.clinical_interpretation}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          clinical_interpretation: e.target.value,
                        }))
                      }
                      placeholder="Additional clinical notes or interpretation guidance for this score range..."
                      className="h-24 rounded-lg border-2"
                    />
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
                      Save Descriptor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Standard Score Descriptors List */}
            {standardDescriptors.length > 0 && (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center gap-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <BarChart3
                      className="w-6 h-6"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                    My Standard Score Descriptors
                  </CardTitle>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Custom descriptors for standard scores (Mean = 100, SD = 15)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Score Range
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Percentile
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Descriptive Term
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Interpretation
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {standardDescriptors.map((descriptor) => (
                          <tr
                            key={descriptor.id}
                            className="border-b border-gray-100"
                          >
                            <td
                              className="py-3 px-4 font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {descriptor.min_score} - {descriptor.max_score}
                            </td>
                            <td
                              className="py-3 px-4"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {descriptor.percentile_range || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={getScoreTypeColor(
                                  descriptor.score_type
                                )}
                              >
                                {descriptor.descriptor}
                              </Badge>
                            </td>
                            <td
                              className="py-3 px-4 text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {descriptor.clinical_interpretation ||
                                "No specific interpretation"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(descriptor)}
                                  className="gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent
                                    style={{
                                      backgroundColor: "var(--card-background)",
                                    }}
                                  >
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Custom Descriptor?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        custom descriptor for score range "
                                        {descriptor.min_score}-
                                        {descriptor.max_score}"? This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        // onClick={() =>
                                        //   handleDelete(descriptor.id)
                                        // }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete Descriptor
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Scaled Score Descriptors List */}
            {scaledDescriptors.length > 0 && (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center gap-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <BarChart3
                      className="w-6 h-6"
                      style={{ color: "var(--secondary-blue)" }}
                    />
                    My Scaled Score Descriptors
                  </CardTitle>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Custom descriptors for scaled scores (Mean = 10, SD = 3)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Score Range
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Percentile
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Descriptive Term
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Interpretation
                          </th>
                          <th
                            className="text-left py-3 px-4 font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scaledDescriptors.map((descriptor) => (
                          <tr
                            key={descriptor.id}
                            className="border-b border-gray-100"
                          >
                            <td
                              className="py-3 px-4 font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {descriptor.min_score} - {descriptor.max_score}
                            </td>
                            <td
                              className="py-3 px-4"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {descriptor.percentile_range || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={getScoreTypeColor(
                                  descriptor.score_type
                                )}
                              >
                                {descriptor.descriptor}
                              </Badge>
                            </td>
                            <td
                              className="py-3 px-4 text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {descriptor.clinical_interpretation ||
                                "No specific interpretation"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(descriptor)}
                                  className="gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent
                                    style={{
                                      backgroundColor: "var(--card-background)",
                                    }}
                                  >
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Custom Descriptor?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        custom descriptor for score range "
                                        {descriptor.min_score}-
                                        {descriptor.max_score}"? This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        // onClick={() =>
                                        //   handleDelete(descriptor.id)
                                        // }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete Descriptor
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {myDescriptors.length === 0 && !isCreating && (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardContent className="p-12 text-center">
                  <BarChart3
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No custom descriptors yet
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Create personalized score descriptors and interpretations
                    for your practice
                  </p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="mt-4 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Descriptor
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
