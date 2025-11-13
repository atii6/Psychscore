import React, { useState, useEffect } from "react";
// import { Assessment, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Brain,
  Save,
  PlusCircle,
  AlertCircle,
  ClipboardEdit,
  Trash2,
} from "lucide-react";

import ManualScoreTable from "../components/manual-entry/ManualScoreTable";

const pronounSets = {
  female: { subjective: "she", objective: "her", possessive: "her" },
  male: { subjective: "he", objective: "him", possessive: "his" },
  nonbinary: { subjective: "they", objective: "them", possessive: "their" },
  other: { subjective: "", objective: "", possessive: "" },
};

export default function ManualEntryPage() {
  const navigate = useNavigate();
  const [clientInfo, setClientInfo] = useState({
    first_name: "",
    last_name: "",
    gender: "female",
    date_of_birth: "",
    subjective_pronoun: "she",
    objective_pronoun: "her",
    possessive_pronoun: "her",
  });
  const [testDate, setTestDate] = useState("");
  const [showRater2, setShowRater2] = useState(false);
  const [raterInfo, setRaterInfo] = useState({
    rater1_first_name: "",
    rater1_last_name: "",
    rater1_suffix: "",
    rater2_first_name: "",
    rater2_last_name: "",
    rater2_suffix: "",
  });
  const [tests, setTests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clientInfo.gender && pronounSets[clientInfo.gender]) {
      const pronouns = pronounSets[clientInfo.gender];
      setClientInfo((prev) => ({
        ...prev,
        subjective_pronoun: pronouns.subjective,
        objective_pronoun: pronouns.objective,
        possessive_pronoun: pronouns.possessive,
      }));
    }
  }, [clientInfo.gender]);

  const handleClientInfoChange = (field, value) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addTestGroup = () => {
    setTests((prev) => [
      ...prev,
      {
        test_name: "",
        scores: [
          {
            subtest_name: "",
            score_type: "standard",
            composite_score: "",
            percentile_rank: "",
            descriptor: "",
          },
        ],
      },
    ]);
  };

  const removeTestGroup = (index) => {
    setTests((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTestName = (index, name) => {
    setTests((prev) =>
      prev.map((test, i) => (i === index ? { ...test, test_name: name } : test))
    );
  };

  const updateScoresForTest = (index, newScores) => {
    setTests((prev) =>
      prev.map((test, i) =>
        i === index ? { ...test, scores: newScores } : test
      )
    );
  };

  const handleSaveAssessment = async () => {
    setError("");
    if (!clientInfo.first_name || !clientInfo.last_name || !testDate) {
      setError(
        "Please fill in the client's first name, last name, and the test date."
      );
      return;
    }

    const allScores = tests.flatMap((test) => {
      if (!test.test_name) {
        setError("Please provide a name for all test groups.");
        return [];
      }
      return test.scores.map((score) => ({
        ...score,
        test_name: test.test_name,
      }));
    });

    if (error) return;

    if (allScores.length === 0) {
      setError("Please enter at least one score.");
      return;
    }

    setIsSaving(true);
    try {
      await Assessment.create({
        client_first_name: clientInfo.first_name,
        client_last_name: clientInfo.last_name,
        gender: clientInfo.gender,
        date_of_birth: clientInfo.date_of_birth,
        subjective_pronoun: clientInfo.subjective_pronoun,
        objective_pronoun: clientInfo.objective_pronoun,
        possessive_pronoun: clientInfo.possessive_pronoun,
        test_date: testDate,
        file_urls: [],
        extracted_scores: allScores,
        status: "processed",
        rater1_first_name: raterInfo.rater1_first_name || undefined,
        rater1_last_name: raterInfo.rater1_last_name || undefined,
        rater1_suffix: raterInfo.rater1_suffix || undefined,
        rater2_first_name: showRater2
          ? raterInfo.rater2_first_name || undefined
          : undefined,
        rater2_last_name: showRater2
          ? raterInfo.rater2_last_name || undefined
          : undefined,
        rater2_suffix: showRater2
          ? raterInfo.rater2_suffix || undefined
          : undefined,
      });
      navigate(createPageUrl("Dashboard"));
    } catch (e) {
      setError("Failed to save the assessment. Please try again.");
      console.error(e);
    }
    setIsSaving(false);
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="rounded-xl border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Manual Score Entry
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Enter assessment scores directly without uploading a file.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain
                  className="w-6 h-6"
                  style={{ color: "var(--secondary-blue)" }}
                />
                Client & Assessment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={clientInfo.first_name}
                    onChange={(e) =>
                      handleClientInfoChange("first_name", e.target.value)
                    }
                    placeholder="Enter first name"
                    className="rounded-lg border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={clientInfo.last_name}
                    onChange={(e) =>
                      handleClientInfoChange("last_name", e.target.value)
                    }
                    placeholder="Enter last name"
                    className="rounded-lg border-2"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={clientInfo.gender}
                    onChange={(e) =>
                      handleClientInfoChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={clientInfo.date_of_birth}
                    onChange={(e) =>
                      handleClientInfoChange("date_of_birth", e.target.value)
                    }
                    className="rounded-lg border-2"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjective">Subjective Pronoun</Label>
                  <Input
                    id="subjective"
                    value={clientInfo.subjective_pronoun}
                    onChange={(e) =>
                      handleClientInfoChange(
                        "subjective_pronoun",
                        e.target.value
                      )
                    }
                    placeholder="he, she, they"
                    className="rounded-lg border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objective">Objective Pronoun</Label>
                  <Input
                    id="objective"
                    value={clientInfo.objective_pronoun}
                    onChange={(e) =>
                      handleClientInfoChange(
                        "objective_pronoun",
                        e.target.value
                      )
                    }
                    placeholder="him, her, them"
                    className="rounded-lg border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="possessive">Possessive Pronoun</Label>
                  <Input
                    id="possessive"
                    value={clientInfo.possessive_pronoun}
                    onChange={(e) =>
                      handleClientInfoChange(
                        "possessive_pronoun",
                        e.target.value
                      )
                    }
                    placeholder="his, her, their"
                    className="rounded-lg border-2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testDate">Test Date</Label>
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="rounded-lg border-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain
                  className="w-6 h-6"
                  style={{ color: "var(--secondary-blue)" }}
                />
                Rater Information (Optional)
              </CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Add information for parents, guardians, or other raters who
                completed rating forms
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Rater 1
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rater1FirstName">First Name</Label>
                    <Input
                      id="rater1FirstName"
                      value={raterInfo.rater1_first_name}
                      onChange={(e) =>
                        setRaterInfo({
                          ...raterInfo,
                          rater1_first_name: e.target.value,
                        })
                      }
                      placeholder="Optional"
                      className="rounded-lg border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rater1LastName">Last Name</Label>
                    <Input
                      id="rater1LastName"
                      value={raterInfo.rater1_last_name}
                      onChange={(e) =>
                        setRaterInfo({
                          ...raterInfo,
                          rater1_last_name: e.target.value,
                        })
                      }
                      placeholder="Optional"
                      className="rounded-lg border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rater1Suffix">Suffix</Label>
                    <Input
                      id="rater1Suffix"
                      value={raterInfo.rater1_suffix}
                      onChange={(e) =>
                        setRaterInfo({
                          ...raterInfo,
                          rater1_suffix: e.target.value,
                        })
                      }
                      placeholder="Jr., Sr., III"
                      className="rounded-lg border-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showRater2"
                    checked={showRater2}
                    onChange={(e) => setShowRater2(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="showRater2" className="cursor-pointer">
                    Add Optional Rater 2
                  </Label>
                </div>

                {showRater2 && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <h4
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Rater 2
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rater2FirstName">First Name</Label>
                        <Input
                          id="rater2FirstName"
                          value={raterInfo.rater2_first_name}
                          onChange={(e) =>
                            setRaterInfo({
                              ...raterInfo,
                              rater2_first_name: e.target.value,
                            })
                          }
                          placeholder="Optional"
                          className="rounded-lg border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rater2LastName">Last Name</Label>
                        <Input
                          id="rater2LastName"
                          value={raterInfo.rater2_last_name}
                          onChange={(e) =>
                            setRaterInfo({
                              ...raterInfo,
                              rater2_last_name: e.target.value,
                            })
                          }
                          placeholder="Optional"
                          className="rounded-lg border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rater2Suffix">Suffix</Label>
                        <Input
                          id="rater2Suffix"
                          value={raterInfo.rater2_suffix}
                          onChange={(e) =>
                            setRaterInfo({
                              ...raterInfo,
                              rater2_suffix: e.target.value,
                            })
                          }
                          placeholder="Jr., Sr., III"
                          className="rounded-lg border-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardEdit
                  className="w-6 h-6"
                  style={{ color: "var(--secondary-blue)" }}
                />
                Enter Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tests.map((test, index) => (
                <Card key={index} className="bg-gray-50/50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <Input
                      placeholder="Enter Test Name (e.g., WISC-V)"
                      value={test.test_name}
                      onChange={(e) => updateTestName(index, e.target.value)}
                      className="text-lg font-semibold border-0 border-b-2 rounded-none focus:ring-0 focus:border-blue-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTestGroup(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <ManualScoreTable
                    scores={test.scores}
                    onScoresChange={(newScores) =>
                      updateScoresForTest(index, newScores)
                    }
                  />
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={addTestGroup}
                className="w-full gap-2 border-dashed"
              >
                <PlusCircle className="w-4 h-4" />
                Add Another Test
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveAssessment}
              disabled={isSaving}
              className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
              }}
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? "Saving..." : "Save Assessment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
