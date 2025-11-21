import React from "react";
import { Trash2 } from "lucide-react";
import type { SubtestType } from "@/utilitites/types/TestSubtestDefinitions";
import FormTextField from "@/components/form/Fields/FormTextField";
import FormTextareaField from "@/components/form/Fields/FormTextareaField";
import FormSelectField from "@/components/form/Fields/FormSelectField";
import { Grid, GridItem } from "@/components/ui/Grid";
import { Button } from "@/components/ui/button";

type SubtestEditorProps = {
  subtest: SubtestType;
  onUpdate: (subtest: SubtestType) => void;
  onDelete: () => void;
};

const SubtestEditor = ({ subtest, onUpdate, onDelete }: SubtestEditorProps) => {
  const [localSubtest, setLocalSubtest] = React.useState(subtest);

  React.useEffect(() => {
    onUpdate(localSubtest);
  }, [localSubtest]);

  const handleChange = (field: keyof SubtestType, value: any) => {
    setLocalSubtest((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const scoreTypeOptions = [
    { value: "scaled", label: "Scaled" },
    { value: "standard", label: "Standard" },
  ];

  return (
    <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
      <Grid>
        <FormTextField
          size={3}
          name={`display_name_${subtest.canonical_name}`}
          label="Display Name"
          placeholder="e.g., Full Scale IQ"
          value={localSubtest.display_name}
          onChange={(e) => handleChange("display_name", e.target.value)}
        />

        <FormTextField
          size={3}
          name={`canonical_name_${subtest.canonical_name}`}
          label="Canonical Name (snake_case)"
          placeholder="e.g., full_scale_iq"
          value={localSubtest.canonical_name}
          onChange={(e) => handleChange("canonical_name", e.target.value)}
        />

        <FormTextareaField
          name={`aliases_${subtest.canonical_name}`}
          label="Aliases (comma-separated)"
          placeholder="FSIQ, Full Scale IQ, Composite Score"
          value={localSubtest.aliases.join(", ")}
          onChange={(e) =>
            handleChange(
              "aliases",
              e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            )
          }
        />

        <FormSelectField
          size={2}
          name={`score_type_${subtest.canonical_name}`}
          label="Score Type"
          options={scoreTypeOptions}
          value={localSubtest.score_type}
          onChange={(value) => handleChange("score_type", value)}
        />

        <GridItem size={4} className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 self-end"
            type="button"
          >
            <Trash2 className="w-4 h-4 mr-1" /> Remove
          </Button>
        </GridItem>
      </Grid>
    </div>
  );
};

export default SubtestEditor;
