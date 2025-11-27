import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Plus, Search } from "lucide-react";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import useGetAllTestDefinitions from "@/hooks/test-subtest-definitions/useGetAllTestDefinitions";
import TestCreationForm from "@/components/pageComponents/test-bank/TestCreationForm";
import CustomContentCard from "@/components/shared/CustomContentCard";
import TestDetailCard from "@/components/pageComponents/test-bank/TestDetailCard";
import PagesHeader from "@/components/shared/PagesHeader";

export default function TestBankPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("system");
  const [isCreating, setIsCreating] = React.useState(false);

  const { data: TestSubtestDefinition, isLoading } = useGetAllTestDefinitions();
  const systemDefinitions = React.useMemo(
    () => TestSubtestDefinition?.filter((d) => d.is_system_template),
    [TestSubtestDefinition]
  );
  const myDefinitions = React.useMemo(
    () => TestSubtestDefinition?.filter((d) => !d.is_system_template),
    [TestSubtestDefinition]
  );

  const userRole = "admin";

  const renderTestCard = (
    testDef: TestDefinitionType,
    isSystemTab: boolean
  ) => {
    const canEdit = true;

    return <TestDetailCard testDef={testDef} canEdit={canEdit} />;
  };

  const filteredSystemDefinitions = React.useMemo(
    () =>
      systemDefinitions?.filter(
        (def) =>
          !searchTerm.trim() ||
          def.test_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [systemDefinitions, searchTerm]
  );

  const filteredMyDefinitions = React.useMemo(
    () =>
      myDefinitions?.filter(
        (def) =>
          !searchTerm.trim() ||
          def.test_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [myDefinitions, searchTerm]
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
        <PagesHeader
          title="Test Bank"
          description="Define and manage subtest definitions for consistent placeholder
              mapping"
          actionButtonTitle="New Test Definition"
          onAction={() => {
            setIsCreating(true);
            setActiveTab(activeTab);
          }}
        />

        <CustomContentCard cardStyles="mb-6" contentContainerStyles="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[var(--text-secondary)]" />
            <Input
              placeholder="Search test definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 rounded-lg border-2"
            />
          </div>
        </CustomContentCard>

        {isCreating && (
          <TestCreationForm
            activeTab={activeTab}
            setIsCreating={setIsCreating}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="system" className="text-sm font-medium">
              System Test Bank ({filteredSystemDefinitions?.length})
            </TabsTrigger>
            <TabsTrigger value="my" className="text-sm font-medium">
              My Test Bank ({filteredMyDefinitions?.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            {filteredSystemDefinitions &&
            filteredSystemDefinitions.length > 0 ? (
              filteredSystemDefinitions?.map((testDef) =>
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
                    {userRole === "admin"
                      ? "Create the first global test definition for all users"
                      : "No global test definitions available yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my" className="space-y-4">
            {filteredMyDefinitions && filteredMyDefinitions.length > 0 ? (
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
