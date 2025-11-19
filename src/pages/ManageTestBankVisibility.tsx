import React, { useState, useEffect } from "react";
// import { TestSubtestDefinition, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, CheckCircle } from "lucide-react";

export default function ManageTestBankVisibility() {
  const [testDefinitions, setTestDefinitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const definitions = await TestSubtestDefinition.list();
      setTestDefinitions(definitions);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleToggle = (defId, currentValue) => {
    setChanges((prev) => ({
      ...prev,
      [defId]: !currentValue,
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const [defId, newValue] of Object.entries(changes)) {
        await TestSubtestDefinition.update(defId, {
          is_system_template: newValue,
        });
      }

      alert("All changes saved successfully!");
      setChanges({});
      await loadData();
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save some changes. Please try again.");
    }
    setSaving(false);
  };

  const handleSetAllTrue = async () => {
    if (
      !confirm(
        "Are you sure you want to make ALL test definitions visible to all users?"
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      for (const def of testDefinitions) {
        await TestSubtestDefinition.update(def.id, {
          is_system_template: true,
        });
      }

      alert("All test definitions are now globally visible!");
      setChanges({});
      await loadData();
    } catch (error) {
      console.error("Error updating all definitions:", error);
      alert("Failed to update all definitions. Please try again.");
    }
    setSaving(false);
  };

  if (user?.role !== "admin") {
    return (
      <div
        className="min-h-screen p-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p>Only administrators can access this page.</p>
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Manage Test Bank Visibility
          </h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Control which test definitions are visible to all users (Global) vs.
            private
          </p>
        </div>

        <Card
          className="border-0 shadow-lg rounded-2xl mb-6"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Quick Actions</CardTitle>
              <Button
                onClick={handleSetAllTrue}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Make All Global (Visible to Everyone)
              </Button>
            </div>
          </CardHeader>
        </Card>

        {Object.keys(changes).length > 0 && (
          <Card
            className="border-0 shadow-lg rounded-2xl mb-6 bg-blue-50"
            style={{ borderColor: "var(--secondary-blue)" }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    You have {Object.keys(changes).length} unsaved change(s)
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Click "Save Changes" to apply them
                  </p>
                </div>
                <Button onClick={handleSaveAll} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card
          className="border-0 shadow-lg rounded-2xl"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <CardTitle>
              All Test Definitions ({testDefinitions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2
                  className="w-8 h-8 animate-spin mx-auto mb-4"
                  style={{ color: "var(--secondary-blue)" }}
                />
                <p>Loading test definitions...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testDefinitions.map((def) => {
                  const currentValue = changes.hasOwnProperty(def.id)
                    ? changes[def.id]
                    : def.is_system_template;
                  const hasChanged = changes.hasOwnProperty(def.id);

                  return (
                    <div
                      key={def.id}
                      className={`p-4 rounded-lg border-2 ${
                        hasChanged
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {def.test_name}
                          </h3>
                          <p
                            className="text-sm mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Created by: {def.created_by || "Unknown"}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <Badge
                            className={
                              currentValue
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {currentValue ? "Global (All Users)" : "Private"}
                          </Badge>

                          <Button
                            variant={currentValue ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggle(def.id, currentValue)}
                            className={
                              currentValue
                                ? ""
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }
                          >
                            {currentValue ? "Make Private" : "Make Global"}
                          </Button>
                        </div>
                      </div>

                      {hasChanged && (
                        <p className="text-xs mt-2 text-blue-600 font-medium">
                          ⚠ Unsaved change - will become{" "}
                          {changes[def.id] ? "Global" : "Private"} when you save
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
