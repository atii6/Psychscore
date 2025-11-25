import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, HelpCircle, Save } from "lucide-react";

type Props = {};

function AIDescriptorPreferenceCard({}: Props) {
  const [useAiDescriptors, setUseAiDescriptors] = React.useState(false);

  const handleSavePreference = async () => {
    // Users management need to be implemented yet.
    // You can add a toast notification here for user feedback
  };

  const isSavingPreferences = false;

  return (
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
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
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
                    Test specific descriptors that are extracted during the
                    upload process
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
            disabled={isSavingPreferences}
            className="text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSavingPreferences ? "Saving..." : "Save Preference"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIDescriptorPreferenceCard;
