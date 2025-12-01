import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import CustomContentCard from "@/components/shared/CustomContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useDeleteScoreDescriptor from "@/hooks/user-score-descriptor/useDeleteUserScoreDescriptor";
import { cn } from "@/lib/utils";
import { getScoreTypeColor } from "@/utilitites/helpers/getScoreTypeColor";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { BarChart3, Edit, Trash2 } from "lucide-react";

type Props = {
  descriptor: UserScoreDescriptorType;
  handleEdit: (descriptor: UserScoreDescriptorType) => void;
};

function UserScoreDescriptorCard({ descriptor, handleEdit }: Props) {
  const { mutateAsync: deleteScoreDescriptor, isPending: isDeleting } =
    useDeleteScoreDescriptor();

  const handleDelete = async (descriptorId: number) => {
    await deleteScoreDescriptor(descriptorId);
  };
  return (
    <CustomContentCard
      cardStyles="hover:shadow-xl transition-all duration-200"
      contentContainerStyles="p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--light-blue)" }}
          >
            <BarChart3
              className="w-6 h-6"
              style={{ color: "var(--secondary-blue)" }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className="font-semibold text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                {descriptor.descriptor}
              </h3>
              <Badge
                className={cn(
                  "capitalize",
                  getScoreTypeColor(descriptor.score_type)
                )}
              >
                {descriptor.score_type}
              </Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span style={{ color: "var(--text-secondary)" }}>
                  Score Range:
                </span>
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {descriptor.min_score} - {descriptor.max_score}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>
                  Descriptor:
                </span>
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {descriptor.descriptor}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>
                  Percentile:
                </span>
                <p
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {descriptor.percentile_range || "N/A"}
                </p>
              </div>
            </div>
            {descriptor.clinical_interpretation && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {descriptor.clinical_interpretation}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(descriptor)}
            className="gap-2"
            disabled={isDeleting}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <CustomAlertDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            }
            title="Delete Descriptor?"
            description="Are you sure you want to delete this custom descriptor? This
                    action cannot be undone."
            onAction={() => handleDelete(descriptor.id)}
            actionButtonText="Delete Descriptor"
            actionButtonStyles="bg-red-600 hover:bg-red-700"
          />
        </div>
      </div>
    </CustomContentCard>
  );
}

export default UserScoreDescriptorCard;
