import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import { Button } from "@/components/ui/button";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";
import { Edit, Trash2 } from "lucide-react";

type Props = {
  testDef: TestDefinitionType;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
};

function TestUserActions({ testDef, onEdit, onDelete, isLoading }: Props) {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        type="button"
        disabled={isLoading}
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
      <CustomAlertDialog
        trigger={
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            type="button"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        }
        title="Delete Test Definition?"
        description={` Are you sure you want to delete the definition for "
                            ${testDef.test_name}"? This action cannot be undone.`}
        onAction={onDelete}
        actionButtonStyles="bg-red-600 hover:bg-red-700"
      />
    </>
  );
}

export default TestUserActions;
