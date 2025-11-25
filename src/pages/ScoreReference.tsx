import * as React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SCORE_TYPE } from "@/utilitites/constants";
import type { UserScoreDescriptorType } from "@/utilitites/types/UserScoreDescriptor";
import StandardScoreCard from "@/components/pageComponents/score-reference/StandardScoreCard";
import ScaledScoreCard from "@/components/pageComponents/score-reference/ScaledScoreCard";
import FooterNoteCard from "@/components/pageComponents/score-reference/FooterNoteCard";
import AIDescriptorPreferenceCard from "@/components/pageComponents/score-reference/AIDescriptorPreferenceCard";
import ScoreDescriptorForm from "@/components/pageComponents/score-reference/ScoreDescriptorForm";
import ScaledScoreDescriptorTable from "@/components/pageComponents/score-reference/ScaledScoreDescriptorTable";
import StandardScoreDescriptorTable from "@/components/pageComponents/score-reference/StandardScoreDescriptorTable";
import CustomContentCard from "@/components/shared/CustomContentCard";
import useGetAllUserScoreDescriptors from "@/hooks/user-score-descriptor/useGetAllScoreDescriptors";
import useDeleteScoreDescriptor from "@/hooks/user-score-descriptor/useDeleteUserScoreDescriptor";

export default function ScoreDescriptorsPage() {
  const [isCreating, setIsCreating] = React.useState(false);
  const { mutateAsync: deleteScoreDescriptor, isPending } =
    useDeleteScoreDescriptor();
  const [selectedDescriptor, setSelectedDescriptor] =
    React.useState<UserScoreDescriptorType | null>(null);
  const { data: UserScoreDescriptor } = useGetAllUserScoreDescriptors();

  const handleEdit = (descriptor: UserScoreDescriptorType) => {
    setSelectedDescriptor(descriptor);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedDescriptor(null);
  };

  // Group custom descriptors by score type and sort them
  const standardDescriptors = UserScoreDescriptor?.filter(
    (d) => d.score_type === SCORE_TYPE.STANDARD
  ).sort((a, b) => a.min_score - b.min_score);
  const scaledDescriptors = UserScoreDescriptor?.filter(
    (d) => d.score_type === SCORE_TYPE.SCALED
  ).sort((a, b) => a.min_score - b.min_score);

  const handleDelete = async (descriptorId: number) => {
    await deleteScoreDescriptor(descriptorId);
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Score Descriptors
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage standard and custom descriptive terms for psychological
              assessments
            </p>
          </div>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="system" className="text-sm font-medium">
              System Descriptors
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-sm font-medium">
              My Descriptors ({UserScoreDescriptor?.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            {/* Standard Score Table */}
            <StandardScoreCard />

            {/* Scaled Score Table */}
            <ScaledScoreCard />

            {/* Footer Note */}
            <FooterNoteCard />
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            {/* AI Descriptor Preference Card */}
            <AIDescriptorPreferenceCard />

            {/* Add Button removed from here */}

            {/* Create/Edit Form */}
            {isCreating && (
              <ScoreDescriptorForm
                descriptor={selectedDescriptor}
                onCancel={handleCancel}
              />
            )}

            {/* Custom Standard Score Descriptors List */}
            {standardDescriptors && standardDescriptors.length > 0 && (
              <StandardScoreDescriptorTable
                standardDescriptors={standardDescriptors}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isActionPending={isCreating || isPending}
              />
            )}

            {/* Custom Scaled Score Descriptors List */}
            {scaledDescriptors && scaledDescriptors.length > 0 && (
              <ScaledScoreDescriptorTable
                scaledDescriptors={scaledDescriptors}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isActionPending={isCreating || isPending}
              />
            )}

            {UserScoreDescriptor &&
              UserScoreDescriptor.length === 0 &&
              !isCreating && (
                <>
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
                      Create personalized score descriptors and interpretations
                      for your practice
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
                </>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
