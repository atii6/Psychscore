import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useGetAllUserScoreDescriptors from "@/hooks/user-score-descriptor/useGetAllScoreDescriptors";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import ScoreDescriptorForm from "@/components/pageComponents/score-reference/ScoreDescriptorForm";
import CustomContentCard from "@/components/shared/CustomContentCard";
import CreateAssessmentHeader from "@/components/pageComponents/manual-entry/CreateAssessmentHeader";
import UserScoreDescriptorCard from "@/components/pageComponents/my-score-descriptor/UserScoreDescriptorCard";

export default function MyDescriptorsPage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = React.useState(false);
  const [selectedDescriptor, setSelectedDescriptor] =
    React.useState<UserScoreDescriptorType | null>(null);

  const { data: UserScoreDescriptor } = useGetAllUserScoreDescriptors();

  const handleEdit = (descriptor: UserScoreDescriptorType) => {
    setSelectedDescriptor(descriptor);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setSelectedDescriptor(null);
    setIsCreating(false);
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <CreateAssessmentHeader
          title="My Custom Descriptors"
          description="Create personalized score descriptors and interpretations for your
              practice"
          onAction={() => navigate(createPageUrl("Templates"))}
          onAddAction={() => setIsCreating(true)}
          addActionText="Add Descriptor"
        />

        {/* Create/Edit Form */}
        {isCreating && (
          <ScoreDescriptorForm
            descriptor={selectedDescriptor}
            onCancel={handleCancel}
            cardStyles="mb-6"
          />
        )}

        {/* Descriptors List */}
        <div className="grid gap-4">
          {UserScoreDescriptor?.map((descriptor) => (
            <UserScoreDescriptorCard
              key={descriptor.id}
              descriptor={descriptor}
              handleEdit={handleEdit}
            />
          ))}

          {UserScoreDescriptor && UserScoreDescriptor.length === 0 && (
            <CustomContentCard
              cardStyles="text-[var(--card-background)]"
              contentContainerStyles="p-12 text-center"
            >
              <BarChart3
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No custom descriptors yet
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Create personalized score descriptors and interpretations for
                your practice
              </p>
              <Button
                onClick={() => setIsCreating(true)}
                className="mt-4 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Descriptor
              </Button>
            </CustomContentCard>
          )}
        </div>
      </div>
    </div>
  );
}
