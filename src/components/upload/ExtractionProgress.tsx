import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, FileSearch } from "lucide-react";

export default function ExtractionProgress({
  progress,
  isExtracting,
  fileName,
}) {
  return (
    <Card
      className="border-0 shadow-lg rounded-2xl"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2 text-xl"
          style={{ color: "var(--text-primary)" }}
        >
          <Brain
            className="w-6 h-6"
            style={{ color: "var(--secondary-blue)" }}
          />
          Extracting Score Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FileSearch
                className="w-16 h-16"
                style={{ color: "var(--secondary-blue)" }}
              />
              {isExtracting && (
                <Loader2
                  className="w-6 h-6 animate-spin absolute -top-1 -right-1"
                  style={{ color: "var(--primary-blue)" }}
                />
              )}
            </div>
          </div>

          <h3
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Processing {fileName}
          </h3>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            AI is analyzing your assessment file and extracting score data
          </p>

          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {progress}% Complete
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
