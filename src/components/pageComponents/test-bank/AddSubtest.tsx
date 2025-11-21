import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFormContext } from "react-hook-form";
import SubtestEditor from "./SubtestEditor";
import type { SubtestType } from "@/utilitites/types/TestSubtestDefinitions";

type AddSubtestProps = {
  isEditingTest?: boolean;
};

function AddSubtest({ isEditingTest = false }: AddSubtestProps) {
  const { watch, setValue } = useFormContext();
  const subtests: SubtestType[] = React.useMemo(
    () => watch("subtests") || [],
    [watch("subtests")]
  );

  const handleAddSubtestToNewTest = () => {
    const newSubtest: SubtestType = {
      canonical_name: "",
      display_name: "",
      aliases: [],
      score_type: "standard",
      is_user_defined: true,
    };

    setValue("subtests", [...subtests, newSubtest], { shouldDirty: true });
  };

  const handleUpdateSubtestInNewTest = (
    updatedSubtest: SubtestType,
    index: number
  ) => {
    const updated = [...subtests];
    updated[index] = updatedSubtest;
    setValue("subtests", updated, { shouldDirty: true });
  };

  const handleDeleteSubtestFromNewTest = (index: number) => {
    const updated = subtests.filter((_: SubtestType, i: number) => i !== index);
    setValue("subtests", updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Subtests</h4>
        {!isEditingTest && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSubtestToNewTest}
            className="gap-2"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Add Subtest
          </Button>
        )}
      </div>

      {subtests.length > 0 ? (
        <div className="space-y-4">
          {subtests.map((subtest, index) => (
            <SubtestEditor
              key={index}
              subtest={subtest}
              onUpdate={(updated) =>
                handleUpdateSubtestInNewTest(updated, index)
              }
              onDelete={() => handleDeleteSubtestFromNewTest(index)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic py-4 text-center bg-gray-50 rounded-lg">
          No subtests added yet. Click "Add Subtest" to define subtests for this
          test.
        </p>
      )}

      {isEditingTest && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSubtestToNewTest}
          className="gap-2 !mt-4"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Subtest
        </Button>
      )}
    </>
  );
}

export default AddSubtest;
