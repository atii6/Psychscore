import CustomAlertDialog from "@/components/shared/CustomAlertDialog";
import CustomContentCard from "@/components/shared/CustomContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getScoreTypeColor } from "@/utilitites/helpers/getScoreTypeColor";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import { BarChart3, Edit, Trash2 } from "lucide-react";

type Props = {
  scaledDescriptors: UserScoreDescriptorType[];
  onEdit: (descriptor: UserScoreDescriptorType) => void;
  onDelete: (descriptorId: number) => void;
  isActionPending?: boolean;
};

function ScaledScoreDescriptorTable({
  scaledDescriptors,
  onEdit,
  onDelete,
  isActionPending = false,
}: Props) {
  return (
    <CustomContentCard
      title="My Scaled Score Descriptors"
      description="Custom descriptors for scaled scores (Mean = 10, SD = 3)"
      descriptionStyles="text-[var(--text-secondary)]"
      Icon={BarChart3}
      iconProps={{ className: "w-6 h-6 text-[var(--secondary-blue)]" }}
    >
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead
                className="text-left py-3 px-4 font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Score Range
              </TableHead>
              <TableHead
                className="text-left py-3 px-4 font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Percentile
              </TableHead>
              <TableHead
                className="text-left py-3 px-4 font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Descriptive Term
              </TableHead>
              <TableHead
                className="text-left py-3 px-4 font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Interpretation
              </TableHead>
              <TableHead
                className="text-left py-3 px-4 font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scaledDescriptors.map((descriptor) => (
              <TableRow
                key={descriptor.id}
                className="border-b border-gray-100"
              >
                <TableCell
                  className="py-3 px-4 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {descriptor.min_score} - {descriptor.max_score}
                </TableCell>
                <TableCell
                  className="py-3 px-4"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {descriptor.percentile_range || "N/A"}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Badge className={getScoreTypeColor(descriptor.score_type)}>
                    {descriptor.descriptor}
                  </Badge>
                </TableCell>
                <TableCell
                  className="py-3 px-4 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {descriptor.clinical_interpretation ||
                    "No specific interpretation"}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(descriptor)}
                      className="gap-2"
                      disabled={isActionPending}
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
                          disabled={isActionPending}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      }
                      title="Delete Custom Descriptor?"
                      description={`Are you sure you want to delete this custom
                            descriptor for score range "${descriptor.min_score}-
                            ${descriptor.max_score}"? This action cannot be
                            undone.`}
                      onAction={() => onDelete(descriptor.id)}
                      actionButtonText="Delete Descriptor"
                      actionButtonStyles="bg-red-600 hover:bg-red-700"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CustomContentCard>
  );
}

export default ScaledScoreDescriptorTable;
