import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import useGetAllTestDefinitions from "@/hooks/test-subtest-definitions/useGetAllTestDefinitions";
import ManageTestVisibilityCard from "@/components/pageComponents/test-bank-visibility/ManageTestVisibilityCard";
import QuickActionCard from "@/components/pageComponents/test-bank-visibility/QuickActionCard";
import UnsavedChangesCard from "@/components/pageComponents/test-bank-visibility/UnsavedChangesCard";

export default function ManageTestBankVisibility() {
  const [changes, setChanges] = React.useState<Record<string, boolean>>({});
  const { data: testDefinitions = [], isLoading } = useGetAllTestDefinitions();
  const isUserAdmin = true;

  const handleToggle = (defId: string | number, currentValue: boolean) => {
    setChanges((prev) => ({
      ...prev,
      [defId]: !currentValue,
    }));
  };

  if (!isUserAdmin) {
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

        <QuickActionCard
          testDefinitions={testDefinitions}
          setChanges={setChanges}
        />

        {Object.keys(changes).length > 0 && (
          <UnsavedChangesCard
            testDefinitions={testDefinitions}
            changes={changes}
            setChanges={setChanges}
          />
        )}

        <ManageTestVisibilityCard
          testDefinitions={testDefinitions}
          isLoading={isLoading}
          changes={changes}
          handleToggle={handleToggle}
        />
      </div>
    </div>
  );
}
