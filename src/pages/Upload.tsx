import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle2,
  AlertCircle,
  FileWarning,
  Trash2,
  Save,
} from "lucide-react";

import FileUploadZone from "../components/upload/FileUploadZone";
import ScoreReview from "../components/upload/ScoreReview";
import Form from "@/components/form/Form";
import { GridItem } from "@/components/ui/Grid";
import AssessmentInformationCard from "@/components/pageComponents/upload/AssessmentInformationCard";
import FileUploadingCard from "@/components/pageComponents/upload/FileUplaodingCard";
import ProcessingCard from "@/components/pageComponents/upload/ProcessingCard";
import RaterInformationCard from "@/components/pageComponents/upload/RaterInformationCard";
import CustomContentCard from "@/components/shared/CustomContentCard";
import {
  assessmentInitialValues,
  assessmentValidationSchema,
  type AssessmentValidationSchemaType,
} from "./ManualEntry";
import useCreateAssessment from "@/hooks/assessments/useCreateAssessment";
import {
  deepClone,
  generateNewSubtests,
  groupScoresByTest,
  processSubtests,
} from "@/utilitites/helpers/descriptorEvaluationHelpers";
import { ASSESSMENT_STATUS } from "@/utilitites/constants";
import useGetAllReportTemplates from "@/hooks/report-templates/useGetAllReportTemplates";
import useGetAllUserScoreDescriptors from "@/hooks/user-score-descriptor/useGetAllScoreDescriptors";
import type { UploadFileType } from "@/utilitites/types/UploadFile";
import type { ExtractedScore, GenderType } from "@/utilitites/types/Assessment";
import useUpdateTestDefinition from "@/hooks/test-subtest-definitions/useUpdateTestDefinition";
import useGetAllTestDefinitions from "@/hooks/test-subtest-definitions/useGetAllTestDefinitions";
import useCreateTestDefinition from "@/hooks/test-subtest-definitions/useCreateTestDefinition";
import { normalizeForMatching } from "@/utilitites/helpers/common";
import CreateAssessmentHeader from "@/components/pageComponents/manual-entry/CreateAssessmentHeader";
import useUploadFile from "@/hooks/files/UseUploadFile";
import useGetExtractedFileData from "@/hooks/files/useExtractFiles";
import {
  applyDescriptor,
  findMatchingTemplate,
  generateTemplateWarning,
  mapScoresToCanonicalNames,
} from "@/utilitites/helpers/processFileHelpers";
import type { ScoreType } from "@/utilitites/types/TestSubtestDefinitions";
import useRemoveFile from "@/hooks/files/UseRemoveFile";
import FormButton from "@/components/form/Fields/FormButton";

export default function UploadPage() {
  const {
    mutateAsync: createAssessment,
    isPending: isCreatingAssessment,
    isError,
    error,
  } = useCreateAssessment();
  const { data: ReportTemplate } = useGetAllReportTemplates();
  const { data: UserScoreDescriptor } = useGetAllUserScoreDescriptors();
  const { data: TestSubtestDefinition } = useGetAllTestDefinitions();
  const { mutateAsync: updateTestDefinition } = useUpdateTestDefinition();
  const { mutateAsync: createTestDefinition } = useCreateTestDefinition();
  const { mutateAsync: removeUploadedFile } = useRemoveFile();
  const navigate = useNavigate();

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadFileType[]>(
    []
  );
  const [allExtractedScores, setAllExtractedScores] = React.useState<
    ExtractedScore[]
  >([]);

  const [selectedScores, setSelectedScores] = React.useState(new Set());
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const { mutateAsync: uploadFile, isPending: isUploadingFile } =
    useUploadFile();
  const {
    mutateAsync: extractFileData,
    isPending: isPendingExtraction,
    isSuccess: hasProcessedFiles,
  } = useGetExtractedFileData();

  const handleFileSelect = async (files: FileList | File[]) => {
    const filesArray = Array.isArray(files) ? files : Array.from(files);
    const newFiles = filesArray.filter(
      (file) => !uploadedFiles.some((f) => f.original_name === file.name)
    );

    if (newFiles.length === 0) {
      return;
    }

    try {
      const results: UploadFileType[] = await Promise.all(
        newFiles.map((file) => uploadFile({ file }))
      );

      setUploadedFiles((prev) => [...prev, ...results]);
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  const handleProcessFiles = async () => {
    setWarnings([]);

    const useAiDescriptors = true;
    let extractedTest: ExtractedScore[] = [];
    const newWarnings: string[] = [];

    for (const file of uploadedFiles) {
      try {
        const result = await extractFileData({ uploadId: file.id });

        if (result.status !== "success" || !result.output?.tests) {
          throw new Error(
            "Could not extract score data from file. The file may be unreadable or contain no relevant data."
          );
        }

        for (const detectedTest of result.output.tests) {
          const { test_name, scores } = detectedTest;

          // Enrich scores with source info
          const flattened: ExtractedScore[] = scores.map((score) => ({
            ...score,
            score_type: score.score_type as ScoreType,
            test_name,
            source_file: file.filename,
          }));
          extractedTest.push(...flattened);

          // Template matching
          const personalTemplates = ReportTemplate?.filter(
            (t) => !t.is_system_template
          );
          const systemTemplates = ReportTemplate?.filter(
            (t) => t.is_system_template
          );

          let templateFound = findMatchingTemplate(
            personalTemplates || [],
            test_name
          );
          if (!templateFound)
            templateFound = findMatchingTemplate(
              systemTemplates || [],
              test_name
            );

          if (!templateFound) {
            const warning = generateTemplateWarning(test_name);
            if (!newWarnings.includes(warning)) newWarnings.push(warning);
          }
        }
      } catch (error) {
        console.error("Error processing file:", error);
        return;
      }
    }

    // Map to canonical names & apply descriptors
    const mappedScores = mapScoresToCanonicalNames(
      extractedTest,
      TestSubtestDefinition || []
    );

    const finalScores = mappedScores.map((score) => {
      const { finalDescriptor, finalPercentileRange, customApplied } =
        applyDescriptor(score, UserScoreDescriptor || [], useAiDescriptors);

      return {
        ...score,
        descriptor: finalDescriptor,
        percentile_range: finalPercentileRange,
        custom_descriptor_applied: customApplied,
      };
    });

    setAllExtractedScores(finalScores);
    setWarnings(newWarnings);
  };

  const handleUpdateScores = (updatedScores: ExtractedScore[]) => {
    setAllExtractedScores(updatedScores);
  };

  const learnFromExtractedScores = async (
    extractedScores: ExtractedScore[]
  ) => {
    try {
      const testGroups = groupScoresByTest(extractedScores);

      for (const [testName, scores] of Object.entries(testGroups)) {
        const normalizedUploadName = normalizeForMatching(testName);

        const allUserDefinitions = TestSubtestDefinition?.filter(
          (d) => !d.is_system_template
        );

        let matchedDefinition = allUserDefinitions?.find((def) => {
          return (
            normalizeForMatching(def.test_name) === normalizedUploadName ||
            def.test_aliases?.some(
              (alias) => normalizeForMatching(alias) === normalizedUploadName
            )
          );
        });

        if (matchedDefinition) {
          let currentSubtests = deepClone(matchedDefinition.subtests || []);

          const { updatedSubtests, hasChanges } = processSubtests(
            currentSubtests,
            scores
          );

          if (hasChanges) {
            await updateTestDefinition({
              id: matchedDefinition.id,
              testDefData: {
                ...matchedDefinition,
                subtests: updatedSubtests,
              },
            });
          }

          continue;
        }

        const initialSubtests = generateNewSubtests(scores);

        await createTestDefinition({
          testDefData: {
            test_name: testName,
            test_aliases: [testName],
            subtests: initialSubtests,
            created_by: "",
            subtest_placeholders: [],
          },
        });
      }
    } catch (error) {
      console.error("Error in Test Bank mapping process:", error);
    }
  };

  const handleSaveAssessment = async (
    values: AssessmentValidationSchemaType
  ) => {
    const assessment = {
      ...values,
      gender: values.gender as GenderType,
      file_urls: [],
      extracted_scores: allExtractedScores,
      status: ASSESSMENT_STATUS.PROCESSED,
      is_active: true,
      is_sample: false,
    };

    try {
      await createAssessment({ assessment });

      await learnFromExtractedScores(allExtractedScores);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving assessment:", error);
    }
  };

  const removeFile = async (id: number, fileName: string) => {
    try {
      await removeUploadedFile(id);

      const isLastFile =
        uploadedFiles.length === 1 && uploadedFiles[0].filename === fileName;

      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

      const newAllExtractedScores = allExtractedScores.filter(
        (score) => score.test_name !== fileName
      );
      setAllExtractedScores(newAllExtractedScores);

      const newSelected = new Set(selectedScores);
      allExtractedScores.forEach((score) => {
        if (score.test_name === fileName) {
          const scoreKey = `${score.test_name}__${score.subtest_name}`;
          newSelected.delete(scoreKey);
        }
      });
      setSelectedScores(newSelected);

      if (isLastFile || newAllExtractedScores.length === 0) {
        // setHasProcessedFiles(false);
        setWarnings([]);
        setSelectedScores(new Set());
      }
    } catch (err) {
      console.error("Failed to delete file", err);
    }
  };

  const handleToggleAllScores = (
    scoresForTest: ExtractedScore[],
    testName: string
  ) => {
    const newSelection = new Set(selectedScores);
    const scoreKeysForTest = scoresForTest.map(
      (s) => `${testName}__${s.subtest_name}`
    );
    const allSelected = scoreKeysForTest.every((key) => newSelection.has(key));

    if (allSelected) {
      scoreKeysForTest.forEach((key) => newSelection.delete(key));
    } else {
      scoreKeysForTest.forEach((key) => newSelection.add(key));
    }
    setSelectedScores(newSelection);
  };

  const handleDeleteSelectedScores = (scoreKeysToDelete: string[]) => {
    const newAllExtractedScores = allExtractedScores.filter((score) => {
      const key = `${score.test_name}__${score.subtest_name}`;
      return !scoreKeysToDelete.includes(key);
    });
    setAllExtractedScores(newAllExtractedScores);

    const newSelected = new Set(selectedScores);
    scoreKeysToDelete.forEach((key) => newSelected.delete(key));
    setSelectedScores(newSelected);

    if (newAllExtractedScores.length === 0) {
      // setHasProcessedFiles(false);
      setWarnings([]);
    }
  };

  const groupedScores = groupScoresByTest(allExtractedScores);

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <CreateAssessmentHeader
          title="Upload Assessment Files"
          description="Upload and extract psychological assessment scores"
          onAction={() => navigate(createPageUrl("Dashboard"))}
        />

        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle size={18} />
              {error.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Form
            initialValues={assessmentInitialValues}
            validationSchema={assessmentValidationSchema}
            onSubmit={handleSaveAssessment}
          >
            <GridItem>
              <AssessmentInformationCard />
            </GridItem>

            <GridItem>
              <RaterInformationCard />
            </GridItem>

            <GridItem>
              <FileUploadZone
                onFileSelect={handleFileSelect}
                isUploading={isUploadingFile}
              />
            </GridItem>

            <GridItem>
              {uploadedFiles.length > 0 && (
                <FileUploadingCard
                  uploadedFiles={uploadedFiles}
                  removeFile={removeFile}
                  handleProcessFiles={handleProcessFiles}
                  isProcessing={isPendingExtraction}
                  hasProcessedFiles={hasProcessedFiles}
                />
              )}
            </GridItem>

            <GridItem> {isPendingExtraction && <ProcessingCard />}</GridItem>

            {hasProcessedFiles && allExtractedScores.length > 0 && (
              <GridItem>
                <CustomContentCard
                  title="Consolidated Scores"
                  description="Review, edit, or delete extracted scores before saving
                        the assessment."
                  Icon={CheckCircle2}
                  iconProps={{ className: "w-6 h-6 text-green-500" }}
                >
                  {Object.entries(groupedScores).map(([testName, scores]) => {
                    const selectedCount = scores.filter((score) =>
                      selectedScores.has(`${testName}__${score.subtest_name}`)
                    ).length;

                    return (
                      <div key={testName}>
                        <div className="flex items-center justify-between mb-3">
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {testName}
                          </h3>
                          {selectedCount > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const keysToDelete = scores
                                  .filter((score) =>
                                    selectedScores.has(
                                      `${testName}__${score.subtest_name}`
                                    )
                                  )
                                  .map(
                                    (score) =>
                                      `${testName}__${score.subtest_name}`
                                  );
                                handleDeleteSelectedScores(keysToDelete);
                              }}
                              className="gap-2"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Selected ({selectedCount})
                            </Button>
                          )}
                        </div>
                        <ScoreReview
                          extractedData={{
                            test_name: testName,
                            scores: scores,
                          }}
                          onUpdateScores={handleUpdateScores}
                          allScores={allExtractedScores}
                          allowDelete={true}
                          selectedScores={selectedScores}
                          onToggleAllScores={() =>
                            handleToggleAllScores(scores, testName)
                          }
                          onDeleteSelectedScores={handleDeleteSelectedScores}
                          setSelectedScores={setSelectedScores}
                        />
                      </div>
                    );
                  })}
                  {warnings.length > 0 && (
                    <Alert
                      variant="default"
                      className="bg-yellow-50 border-yellow-200"
                    >
                      <FileWarning className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800 font-semibold">
                        Template Notice
                      </AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        <ul>
                          {warnings.map((warn, i) => (
                            <li key={i}>- {warn}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end pt-4 border-t mt-4">
                    <FormButton
                      disabled={
                        isCreatingAssessment ||
                        isPendingExtraction ||
                        allExtractedScores.length === 0
                      }
                      className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                      }}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {isCreatingAssessment
                        ? "Saving..."
                        : "Save Final Assessment"}
                    </FormButton>
                  </div>
                </CustomContentCard>
              </GridItem>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
