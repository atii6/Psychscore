import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X } from "lucide-react";
import SubtestEditor from "./SubtestEditor";
import type {
  SubtestType,
  TestDefinitionType,
} from "@/utilitites/types/TestSubtestDefinitions";
import SubtestCard from "./SubtestCard";
import TestAliasesBadge from "./TestAliasesBadge";
import TestUserActions from "./TestUserActions";
import TestDefinitionCardHeader from "./TestDefinitionCardHeader";
import useDeleteTestDefinition from "@/hooks/test-subtest-definitions/useDeleteTestDefinition";
import Form from "@/components/form/Form";
import z from "zod";
import { GridItem } from "@/components/ui/Grid";
import FormTextField from "@/components/form/Fields/FormTextField";
import FormTextareaField from "@/components/form/Fields/FormTextareaField";
import AddSubtest from "./AddSubtest";
import useUpdateTestDefinition from "@/hooks/test-subtest-definitions/useUpdateTestDefinition";

type Props = {
  testDef: TestDefinitionType;
  canEdit: boolean;
};

function TestDetailCard({ testDef, canEdit }: Props) {
  const [expandedTests, setExpandedTests] = React.useState(new Set());
  const [editingTestId, setEditingTestId] = React.useState<number | null>(null);
  const { mutateAsync: deleteTest, isPending } = useDeleteTestDefinition();
  const { mutateAsync: updateTestDefinition, isPending: updatePending } =
    useUpdateTestDefinition();
  const [currentEditingTest, setCurrentEditingTest] =
    React.useState<TestDefinitionType | null>(null);

  const toggleTestExpansion = (testId: number) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const handleDeleteTest = async (testId: number) => {
    await deleteTest(testId);
  };

  const handleStartEdit = (testDef: TestDefinitionType) => {
    const isCreator = true;
    if (!isCreator) {
      alert("You can only edit test definitions you created.");
      return;
    }
    setEditingTestId(testDef.id);
    setCurrentEditingTest(testDef);
  };

  const handleCancelEdit = () => {
    setEditingTestId(null);
    setCurrentEditingTest(null);
  };
  const isEditMode = editingTestId === testDef.id;
  const initialValues = {
    test_name: testDef?.test_name || "",
    test_aliases: testDef?.test_aliases || [],
    subtests: testDef?.subtests || [],
  };

  console.log("initialValues", initialValues);

  const validationSchema = z.object({
    test_name: z.string().min(1, "Test name is required"),
    test_aliases: z.preprocess((val) => {
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }, z.array(z.string())),
    subtests: z.array(z.any()),
  });
  type TestDefValidationSchema = z.infer<typeof validationSchema>;
  const handleSaveEdit = async (values: TestDefValidationSchema) => {
    console.log("handleSaveEdit", values);

    const updatedTest = {
      ...values,
      id: testDef.id,
      subtest_placeholders: values.subtests.map((s) => s.placeholder),
    };

    await updateTestDefinition({
      id: testDef.id,
      testDefData: updatedTest,
    });
    handleCancelEdit();
  };

  return (
    <Form
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSaveEdit}
    >
      <GridItem>
        <Card
          key={testDef.id}
          className="border-0 shadow-lg rounded-2xl"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <TestDefinitionCardHeader
                testDefinition={testDef}
                onToggleExpansion={() => toggleTestExpansion(testDef.id)}
                expandedTests={expandedTests}
              />
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      type="button"
                      disabled={updatePending}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={updatePending}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    {canEdit ? (
                      <TestUserActions
                        testDef={testDef}
                        onEdit={() => handleStartEdit(testDef)}
                        onDelete={() => handleDeleteTest(testDef.id)}
                        isLoading={isPending}
                      />
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
              {isEditMode ? (
                <div className="space-y-6">
                  <FormTextField name="test_name" label="Test Name" />
                  <FormTextareaField
                    name="test_aliases"
                    label="Test Aliases (comma-separated)"
                    placeholder="e.g., WAIS-V, WAIS 5, Wechsler Adult Intelligence Scale"
                  />
                  <GridItem>
                    <AddSubtest isEditingTest={isEditMode} />
                  </GridItem>
                </div>
              ) : (
                <>
                  {testDef.test_aliases?.length > 0 && (
                    <TestAliasesBadge testAliases={testDef.test_aliases} />
                  )}

                  {testDef.subtests && testDef.subtests.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-3">Defined Subtests:</h4>
                      <div className="grid gap-3">
                        {testDef.subtests.map((subtest, idx) => (
                          <SubtestCard key={idx} subtest={subtest} />
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
      </GridItem>
    </Form>
  );
}

export default TestDetailCard;
