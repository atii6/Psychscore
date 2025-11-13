import React, { useState, useEffect } from "react";
// import { TestSubtestDefinition, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Database,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import * as lodash from "lodash";

// Utility function for retrying async operations
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const errorMessage = error.message?.toLowerCase() || "";
      // Only retry for network-related errors
      if (
        errorMessage.includes("network error") ||
        errorMessage.includes("failed to fetch") ||
        errorMessage.includes("timeout")
      ) {
        console.warn(
          `Attempt ${
            i + 1
          }/${retries} failed due to network issue. Retrying in ${
            delay / 1000
          }s...`,
          error
        );
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Last retry failed, re-throw the original error
          throw error;
        }
      } else {
        // Not a network error, re-throw immediately
        throw error;
      }
    }
  }
};

const SubtestEditor = ({ subtest, onUpdate, onDelete }) => {
  const [aliases, setAliases] = useState((subtest.aliases || []).join(", "));

  useEffect(() => {
    setAliases((subtest.aliases || []).join(", "));
  }, [subtest.aliases]);

  useEffect(() => {
    const parsedAliases = aliases
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const currentSubtestAliases = subtest.aliases || [];

    if (!lodash.isEqual(parsedAliases, currentSubtestAliases)) {
      onUpdate({ ...subtest, aliases: parsedAliases });
    }
  }, [aliases, subtest, onUpdate]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Display Name</Label>
          <Input
            value={subtest.display_name}
            onChange={(e) =>
              onUpdate({ ...subtest, display_name: e.target.value })
            }
            placeholder="e.g., Full Scale IQ"
          />
        </div>
        <div>
          <Label className="text-xs">Canonical Name (snake_case)</Label>
          <Input
            value={subtest.canonical_name}
            onChange={(e) =>
              onUpdate({
                ...subtest,
                canonical_name: e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "_"),
              })
            }
            placeholder="e.g., full_scale_iq"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs">Aliases (comma-separated)</Label>
        <Textarea
          value={aliases}
          onChange={(e) => setAliases(e.target.value)}
          placeholder="FSIQ, Full Scale IQ, Composite Score"
          className="h-20"
        />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">Score Type</Label>
          <select
            value={subtest.score_type}
            onChange={(e) =>
              onUpdate({ ...subtest, score_type: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="standard">Standard</option>
            <option value="scaled">Scaled</option>
          </select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 self-end"
        >
          <Trash2 className="w-4 h-4 mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
};

export default function TestBankPage() {
  const [systemDefinitions, setSystemDefinitions] = useState([]);
  const [myDefinitions, setMyDefinitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTests, setExpandedTests] = useState(new Set()); // Fixed: useState should initialize with the state value
  const [editingTestId, setEditingTestId] = useState(null);
  const [currentEditingTest, setCurrentEditingTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("system");
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState(null);
  const [newTestForm, setNewTestForm] = useState({
    test_name: "",
    test_aliases: [],
    subtests: [],
  });

  useEffect(() => {
    loadUserAndTestDefinitions();
  }, []);

  const loadUserAndTestDefinitions = async () => {
    setIsLoading(true);
    try {
      await retry(async () => {
        const currentUser = await User.me();
        setUser(currentUser);

        const allDefinitions = await TestSubtestDefinition.list();

        // Separate system and personal templates - handle both boolean true and string 'true'
        const systemTemps = allDefinitions.filter(
          (d) =>
            d.is_system_template === true || d.is_system_template === "true"
        );

        const myTemps = allDefinitions.filter(
          (d) =>
            (d.is_system_template === false ||
              d.is_system_template === "false" ||
              !d.is_system_template) &&
            d.created_by === currentUser.email
        );

        setSystemDefinitions(
          systemTemps.sort((a, b) => a.test_name.localeCompare(b.test_name))
        );
        setMyDefinitions(
          myTemps.sort((a, b) => a.test_name.localeCompare(b.test_name))
        );
      });
    } catch (error) {
      console.error(
        "Error loading test definitions after multiple retries:",
        error
      );
      alert(
        "Failed to load test definitions due to a network error or other issue. Please refresh the page."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTestExpansion = (testId) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const handleCreateTest = async () => {
    if (!newTestForm.test_name.trim()) {
      alert("Please enter a test name");
      return;
    }

    const testToCreate = {
      ...newTestForm,
      is_system_template: user?.role === "admin" && activeTab === "system",
      created_by: user?.email,
    };

    try {
      await retry(async () => {
        await TestSubtestDefinition.create(testToCreate);
      });
      setNewTestForm({ test_name: "", test_aliases: [], subtests: [] });
      setIsCreating(false);
      loadUserAndTestDefinitions();
    } catch (error) {
      console.error("Error creating test definition:", error);
      const errorMessage = error.message?.toLowerCase() || "";
      if (
        errorMessage.includes("network error") ||
        errorMessage.includes("failed to fetch")
      ) {
        alert(
          "Network error occurred while creating. Please check your connection and try again."
        );
      } else {
        alert(
          "Failed to create test definition. Please try again. " + error.message
        );
      }
    }
  };

  const handleAddSubtestToNewTest = () => {
    const newSubtest = {
      canonical_name: "",
      display_name: "",
      aliases: [],
      score_type: "standard",
      is_user_defined: true,
    };
    setNewTestForm({
      ...newTestForm,
      subtests: [...(newTestForm.subtests || []), newSubtest],
    });
  };

  const handleUpdateSubtestInNewTest = (updatedSubtest, index) => {
    const updatedSubtests = [...(newTestForm.subtests || [])];
    updatedSubtests[index] = updatedSubtest;
    setNewTestForm({ ...newTestForm, subtests: updatedSubtests });
  };

  const handleDeleteSubtestFromNewTest = (index) => {
    const updatedSubtests = (newTestForm.subtests || []).filter(
      (_, i) => i !== index
    );
    setNewTestForm({ ...newTestForm, subtests: updatedSubtests });
  };

  const handleDeleteTest = async (testId) => {
    const testExists = [...systemDefinitions, ...myDefinitions].find(
      (t) => t.id === testId
    );
    if (!testExists) {
      // Test might have already been deleted by another user/tab, just refresh
      await loadUserAndTestDefinitions();
      return;
    }

    try {
      await retry(async () => {
        await TestSubtestDefinition.delete(testId);
      });
      // Successfully deleted - reload the list
      await loadUserAndTestDefinitions();
    } catch (error) {
      const errorMessage = error.message?.toLowerCase() || "";

      // Handle "not found" errors - already deleted
      if (errorMessage.includes("not found") || errorMessage.includes("404")) {
        console.log(
          "Test definition was already deleted or not found, refreshing list..."
        );
        alert(
          "The test definition was not found or already deleted. Refreshing the list."
        );
      }
      // Handle permission errors
      else if (
        errorMessage.includes("permission denied") ||
        errorMessage.includes("forbidden") ||
        errorMessage.includes("403")
      ) {
        alert(
          "You don't have permission to delete this test definition. Only the creator can delete templates."
        );
      }
      // Handle network errors (already covered by retry, but useful for final alert message)
      else if (
        errorMessage.includes("network error") ||
        errorMessage.includes("failed to fetch")
      ) {
        alert(
          "Network error occurred while deleting. Please check your connection and try again."
        );
      }
      // For other errors, log and alert
      else {
        console.error("Error deleting test definition:", error);
        alert(
          "Failed to delete test definition. Please try again. " + error.message
        );
      }
      // Always reload on delete attempt, to ensure UI is consistent with backend state
      await loadUserAndTestDefinitions();
    }
  };

  const handleStartEdit = (testDef) => {
    const isSystemTemplate = testDef.is_system_template === true;
    const isCreator = testDef.created_by === user?.email;

    if (!isCreator) {
      alert("You can only edit test definitions you created.");
      return;
    }

    setEditingTestId(testDef.id);
    setCurrentEditingTest(
      lodash.cloneDeep({
        ...testDef,
        test_aliases_string: (testDef.test_aliases || []).join(", "),
      })
    );
  };

  const handleCancelEdit = () => {
    setEditingTestId(null);
    setCurrentEditingTest(null);
  };

  const handleSaveEdit = async () => {
    if (!currentEditingTest) return;

    const finalTestToSave = {
      test_name: currentEditingTest.test_name,
      test_aliases: currentEditingTest.test_aliases_string
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      subtests: currentEditingTest.subtests,
      is_system_template: currentEditingTest.is_system_template,
    };

    try {
      await retry(async () => {
        await TestSubtestDefinition.update(
          currentEditingTest.id,
          finalTestToSave
        );
      });
      handleCancelEdit();
      loadUserAndTestDefinitions();
    } catch (error) {
      console.error("Error updating test definition:", error);
      const errorMessage = error.message?.toLowerCase() || "";

      if (
        errorMessage.includes("permission denied") ||
        errorMessage.includes("forbidden") ||
        errorMessage.includes("403")
      ) {
        alert("You don't have permission to update this test definition.");
      } else if (
        errorMessage.includes("network error") ||
        errorMessage.includes("failed to fetch")
      ) {
        alert(
          "Network error occurred while saving. Please check your connection and try again."
        );
      } else {
        alert("Failed to save changes. Please try again. " + error.message);
      }
      // Reload even on failure to ensure UI consistency
      loadUserAndTestDefinitions();
    }
  };

  const handleUpdateSubtest = (updatedSubtest, index) => {
    const updatedSubtests = [...(currentEditingTest.subtests || [])];
    updatedSubtests[index] = updatedSubtest;
    setCurrentEditingTest({ ...currentEditingTest, subtests: updatedSubtests });
  };

  const handleAddSubtest = () => {
    const newSubtest = {
      canonical_name: "",
      display_name: "",
      aliases: [],
      score_type: "standard",
      is_user_defined: true,
    };
    setCurrentEditingTest({
      ...currentEditingTest,
      subtests: [...(currentEditingTest.subtests || []), newSubtest],
    });
  };

  const handleDeleteSubtest = (index) => {
    const updatedSubtests = (currentEditingTest.subtests || []).filter(
      (_, i) => i !== index
    );
    setCurrentEditingTest({ ...currentEditingTest, subtests: updatedSubtests });
  };

  const renderTestCard = (testDef, isSystemTab) => {
    const isCreator = testDef.created_by === user?.email;
    const canEdit = isCreator;

    return (
      <Card
        key={testDef.id}
        className="border-0 shadow-lg rounded-2xl"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTestExpansion(testDef.id)}
              >
                {expandedTests.has(testDef.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "var(--light-blue)" }}
              >
                <Database
                  className="w-6 h-6"
                  style={{ color: "var(--secondary-blue)" }}
                />
              </div>
              <div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {testDef.test_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800">
                    {testDef.subtests?.length || 0} subtests defined
                  </Badge>
                  {testDef.test_aliases?.length > 0 && (
                    <Badge className="bg-gray-100 text-gray-600">
                      {testDef.test_aliases.length} aliases
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {editingTestId === testDef.id ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  {canEdit ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(testDef)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent
                          style={{ backgroundColor: "var(--card-background)" }}
                        >
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Test Definition?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the definition for
                              "{testDef.test_name}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTest(testDef.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      View Only
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {expandedTests.has(testDef.id) && (
          <CardContent className="pt-0">
            {editingTestId === testDef.id ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Test Name</Label>
                  <Input
                    value={currentEditingTest.test_name}
                    onChange={(e) =>
                      setCurrentEditingTest({
                        ...currentEditingTest,
                        test_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Aliases (comma-separated)</Label>
                  <Textarea
                    value={currentEditingTest.test_aliases_string || ""}
                    onChange={(e) =>
                      setCurrentEditingTest({
                        ...currentEditingTest,
                        test_aliases_string: e.target.value,
                      })
                    }
                    placeholder="e.g., WAIS-V, WAIS 5, Wechsler Adult Intelligence Scale"
                    className="h-24 font-mono text-sm"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-3">Subtests</h4>
                  <div className="space-y-4">
                    {(currentEditingTest.subtests || []).map((sub, index) => (
                      <SubtestEditor
                        key={index}
                        subtest={sub}
                        onUpdate={(updatedSub) =>
                          handleUpdateSubtest(updatedSub, index)
                        }
                        onDelete={() => handleDeleteSubtest(index)}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubtest}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subtest
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {testDef.test_aliases?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Test Aliases:</h4>
                    <div className="flex flex-wrap gap-2">
                      {testDef.test_aliases.map((alias, idx) => (
                        <Badge key={idx} variant="outline">
                          {alias}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {testDef.subtests && testDef.subtests.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3">Defined Subtests:</h4>
                    <div className="grid gap-3">
                      {testDef.subtests.map((subtest, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium">
                                {subtest.display_name}
                              </span>
                              <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">
                                {subtest.canonical_name}
                              </Badge>
                              <Badge className="ml-1 bg-orange-100 text-orange-800 text-xs capitalize">
                                {subtest.score_type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Aliases:</span>{" "}
                            {(subtest.aliases || []).join(", ") || "None"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No subtests defined yet.
                  </p>
                )}
              </>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const filteredSystemDefinitions = systemDefinitions.filter(
    (def) =>
      !searchTerm.trim() ||
      def.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMyDefinitions = myDefinitions.filter(
    (def) =>
      !searchTerm.trim() ||
      def.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4 md:p-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Loading test definitions...
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Test Bank
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Define and manage subtest definitions for consistent placeholder
              mapping
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setIsCreating(true);
                setActiveTab(user?.role === "admin" ? activeTab : "my");
              }}
              className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
              }}
            >
              <Plus className="w-5 h-5" />
              New Test Definition
            </Button>
          </div>
        </div>

        <Card
          className="border-0 shadow-lg rounded-2xl mb-6"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardContent className="p-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <Input
                placeholder="Search test definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 rounded-lg border-2"
              />
            </div>
          </CardContent>
        </Card>

        {isCreating && (
          <Card
            className="border-0 shadow-lg rounded-2xl mb-6"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            <CardHeader>
              <CardTitle>Create New Test Definition</CardTitle>
              {user?.role === "admin" && activeTab === "system" && (
                <p className="text-sm text-blue-600 mt-2">
                  ✓ As an admin, this test definition will be automatically
                  visible to all users (Global)
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Test Name</Label>
                <Input
                  value={newTestForm.test_name}
                  onChange={(e) =>
                    setNewTestForm((prev) => ({
                      ...prev,
                      test_name: e.target.value,
                    }))
                  }
                  placeholder="e.g., WAIS-5, WISC-V"
                />
              </div>

              <div>
                <Label>Test Aliases (comma-separated)</Label>
                <Textarea
                  value={newTestForm.test_aliases.join(", ")}
                  onChange={(e) =>
                    setNewTestForm((prev) => ({
                      ...prev,
                      test_aliases: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    }))
                  }
                  placeholder="e.g., WAIS-V, WAIS 5, Wechsler Adult Intelligence Scale"
                  className="rounded-lg border-2 h-24 font-mono text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Subtests</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSubtestToNewTest}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subtest
                  </Button>
                </div>
                {newTestForm.subtests && newTestForm.subtests.length > 0 ? (
                  <div className="space-y-4">
                    {newTestForm.subtests.map((sub, index) => (
                      <SubtestEditor
                        key={index}
                        subtest={sub}
                        onUpdate={(updatedSub) =>
                          handleUpdateSubtestInNewTest(updatedSub, index)
                        }
                        onDelete={() => handleDeleteSubtestFromNewTest(index)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg">
                    No subtests added yet. Click "Add Subtest" to define
                    subtests for this test.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTestForm({
                      test_name: "",
                      test_aliases: [],
                      subtests: [],
                    });
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleCreateTest}>
                  <Save className="w-4 h-4 mr-2" />
                  Create Test Definition
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="system" className="text-sm font-medium">
              System Test Bank ({filteredSystemDefinitions.length})
            </TabsTrigger>
            <TabsTrigger value="my" className="text-sm font-medium">
              My Test Bank ({filteredMyDefinitions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            {filteredSystemDefinitions.length > 0 ? (
              filteredSystemDefinitions.map((testDef) =>
                renderTestCard(testDef, true)
              )
            ) : (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardContent className="p-12 text-center">
                  <Database
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No System Test Definitions
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {user?.role === "admin"
                      ? "Create the first global test definition for all users"
                      : "No global test definitions available yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-4">
            {filteredMyDefinitions.length > 0 ? (
              filteredMyDefinitions.map((testDef) =>
                renderTestCard(testDef, false)
              )
            ) : (
              <Card
                className="border-0 shadow-lg rounded-2xl"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardContent className="p-12 text-center">
                  <Database
                    className="w-16 h-16 mx-auto mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No Personal Test Definitions
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Create your first test definition to ensure consistent
                    placeholder mapping
                  </p>
                  <Button
                    onClick={() => {
                      setIsCreating(true);
                      setActiveTab("my");
                    }}
                    className="mt-4 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Test Definition
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
