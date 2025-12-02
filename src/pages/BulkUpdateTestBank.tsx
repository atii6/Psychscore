import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import useGetAllTestDefinitions from "@/hooks/test-subtest-definitions/useGetAllTestDefinitions";
import useUpdateTestDefinition from "@/hooks/test-subtest-definitions/useUpdateTestDefinition";
import useUserStore from "@/store/userStore";

type ResultType = {
  success: boolean;
  message: string;
  count?: number;
  definitions?: string[];
};
export default function BulkUpdateTestBankPage() {
  const [result, setResult] = React.useState<ResultType | null>(null);
  const User = useUserStore(React.useCallback((state) => state.user, []));

  const {
    data: testDefinitions = [],
    isLoading,
    isError,
  } = useGetAllTestDefinitions();

  const { mutateAsync: updateTestDefinition, isPending: isUpdating } =
    useUpdateTestDefinition();

  const handleBulkUpdate = async () => {
    setResult(null);

    try {
      const myDefinitions = testDefinitions.filter(
        (test) => test.created_by === User?.email
      );

      if (myDefinitions.length === 0) {
        setResult({
          success: true,
          message: "No test definitions found that were created by you.",
          count: 0,
        });
        return;
      }

      let updatedCount = 0;

      for (const def of myDefinitions) {
        await updateTestDefinition({
          id: def.id,
          testDefData: { ...def, is_system_template: true }, // Only update what backend expects
        });
        updatedCount++;
      }

      setResult({
        success: true,
        message: `Successfully updated ${updatedCount} test definition(s) to be visible to all users.`,
        count: updatedCount,
        definitions: myDefinitions.map((d) => d.test_name),
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Failed to update test definitions: ${
          error ?? "Unknown error"
        }`,
      });
    }
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-2xl mx-auto">
        <Card
          className="border-0 shadow-lg rounded-2xl"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardHeader>
            <CardTitle style={{ color: "var(--text-primary)" }}>
              Bulk Update Test Bank Definitions
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Loading State */}
            {isLoading && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Loading test definitions...
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {isError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Failed to load test definitions. Please refresh.
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <div>
              <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                This utility will update all TestSubtestDefinition records
                created by you and set their
                <code className="mx-1 px-2 py-1 bg-gray-100 rounded">
                  is_system_template
                </code>
                field to{" "}
                <code className="px-2 py-1 bg-gray-100 rounded">true</code>,
                making them visible to all users.
              </p>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Note:</strong> This is a one-time operation. After
                  running this, you can delete this page.
                </AlertDescription>
              </Alert>
            </div>

            {/* Result */}
            {result && (
              <Alert
                className={
                  result.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}

                <AlertDescription
                  className={result.success ? "text-green-800" : "text-red-800"}
                >
                  {result.message}

                  {result.definitions && result.definitions?.length > 0 && (
                    <div className="mt-2">
                      <strong>Updated definitions:</strong>

                      <ul className="list-disc list-inside mt-1">
                        {result.definitions.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleBulkUpdate}
                disabled={isUpdating || isLoading}
                className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Update All My Test Definitions
                  </>
                )}
              </Button>
            </div>

            {/* Next Steps */}
            {result?.success && result.count && result.count > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Go back to the Test Bank page and refresh to see updated
                      definitions
                    </li>
                    <li>You can safely delete this utility page now</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
