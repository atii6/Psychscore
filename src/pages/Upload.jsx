import React, { useState, useEffect } from "react";
// import { Assessment, ReportTemplate, UserScoreDescriptor, User, TestSubtestDefinition } from "@/api/entities";
// import { UploadFile, ExtractDataFromUploadedFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Upload as UploadIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Brain,
  FileWarning,
  PlusCircle,
  Save,
  FileText,
  Play,
  Trash2,
} from "lucide-react";
import * as lodash from "lodash";

import FileUploadZone from "../components/upload/FileUploadZone";
import ScoreReview from "../components/upload/ScoreReview";
// findStandardizedKey and createFallbackKey are no longer directly used in the updated learnFromExtractedScores logic
// import { findStandardizedKey, createFallbackKey } from "../components/templates/placeholderMapping";

const pronounSets = {
  female: { subjective: "she", objective: "her", possessive: "her" },
  male: { subjective: "he", objective: "him", possessive: "his" },
  nonbinary: { subjective: "they", objective: "them", possessive: "their" },
  other: { subjective: "", objective: "", possessive: "" },
};

// Descriptor calculation logic moved here from ScoreReview.js
const getDescriptorFromPercentile = (percentile) => {
  const pr = parseFloat(percentile);
  if (isNaN(pr) || pr < 0 || pr > 100) {
    return { descriptor: "N/A", percentile_range: "N/A" };
  }

  if (pr >= 98)
    return { descriptor: "Extremely High", percentile_range: "98-99" };
  if (pr >= 91) return { descriptor: "Very High", percentile_range: "91-97" };
  if (pr >= 75)
    return { descriptor: "Above Average", percentile_range: "75-90" };
  if (pr >= 25) return { descriptor: "Average", percentile_range: "25-74" };
  if (pr >= 9) return { descriptor: "Below Average", percentile_range: "9-24" };
  if (pr >= 3) return { descriptor: "Very Low", percentile_range: "3-8" };
  // Covers percentiles 1-2 and any valid numbers below 3 not caught above
  return { descriptor: "Extremely Low", percentile_range: "1-2" };
};

const getDescriptorAndPercentile = (score) => {
  const standardScore = parseFloat(score);
  if (isNaN(standardScore)) {
    return { descriptor: "N/A", percentile_range: "N/A", percentile: 0 };
  }

  if (standardScore >= 130)
    return {
      descriptor: "Extremely High",
      percentile_range: "98-99",
      percentile: 99,
    };
  if (standardScore >= 120)
    return {
      descriptor: "Very High",
      percentile_range: "91-97",
      percentile: 95,
    };
  if (standardScore >= 110)
    return {
      descriptor: "Above Average",
      percentile_range: "75-90",
      percentile: 84,
    };
  if (standardScore >= 90)
    return { descriptor: "Average", percentile_range: "25-74", percentile: 50 };
  if (standardScore >= 80)
    return {
      descriptor: "Below Average",
      percentile_range: "9-24",
      percentile: 16,
    };
  if (standardScore >= 70)
    return { descriptor: "Very Low", percentile_range: "3-8", percentile: 5 };
  // Covers all scores below 70
  return {
    descriptor: "Extremely Low",
    percentile_range: "1-2",
    percentile: 1,
  };
};

const getScaledScoreDescriptor = (scaledScore) => {
  const ss = parseFloat(scaledScore);
  if (isNaN(ss)) {
    return { descriptor: "N/A", percentile: 0, percentile_range: "N/A" };
  }

  if (ss >= 17)
    return {
      descriptor: "Extremely High",
      percentile: 99,
      percentile_range: "98-99",
    };
  if (ss >= 15)
    return {
      descriptor: "Very High",
      percentile: 95,
      percentile_range: "91-97",
    };
  if (ss >= 12)
    return {
      descriptor: "Above Average",
      percentile: 75,
      percentile_range: "75-90",
    };
  if (ss >= 8)
    return { descriptor: "Average", percentile: 50, percentile_range: "25-74" };
  if (ss >= 6)
    return {
      descriptor: "Below Average",
      percentile: 16,
      percentile_range: "9-24",
    };
  if (ss >= 4)
    return { descriptor: "Very Low", percentile: 5, percentile_range: "3-8" };
  // Covers all scores below 4
  return {
    descriptor: "Extremely Low",
    percentile: 1,
    percentile_range: "1-2",
  };
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [clientInfo, setClientInfo] = useState({
    first_name: "",
    last_name: "",
    gender: "female",
    date_of_birth: "",
    subjective_pronoun: "she",
    objective_pronoun: "her",
    possessive_pronoun: "her",
  });
  const [testDate, setTestDate] = useState("");
  const [showRater2, setShowRater2] = useState(false);
  const [raterInfo, setRaterInfo] = useState({
    rater1_first_name: "",
    rater1_last_name: "",
    rater1_suffix: "",
    rater2_first_name: "",
    rater2_last_name: "",
    rater2_suffix: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [allExtractedScores, setAllExtractedScores] = useState([]);
  const [userCustomDescriptors, setUserCustomDescriptors] = useState([]);
  const [selectedScores, setSelectedScores] = new useState(new Set());

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProcessedFiles, setHasProcessedFiles] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);

  const handleClientInfoChange = (field, value) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (clientInfo.gender && pronounSets[clientInfo.gender]) {
      const pronouns = pronounSets[clientInfo.gender];
      setClientInfo((prev) => ({
        ...prev,
        subjective_pronoun: pronouns.subjective,
        objective_pronoun: pronouns.objective,
        possessive_pronoun: pronouns.possessive,
      }));
    }
  }, [clientInfo.gender]);

  useEffect(() => {
    const loadCustomDescriptors = async () => {
      try {
        const user = await User.me();
        // Filter only descriptors created by the current user, as system descriptors are handled by getDescriptorFromPercentile, etc.
        const descriptors = await UserScoreDescriptor.filter({
          created_by: user.email,
        });
        setUserCustomDescriptors(descriptors);
      } catch (error) {
        console.error("Could not load user descriptors", error);
      }
    };
    loadCustomDescriptors();
  }, []);

  const handleFileSelect = async (files) => {
    if (!clientInfo.first_name.trim() || !clientInfo.last_name.trim()) {
      setError("Please enter client's first and last name before uploading.");
      return;
    }

    setError("");
    setIsUploading(true);

    const newFilesToUpload = files.filter(
      (file) => !uploadedFiles.some((f) => f.name === file.name)
    );

    if (newFilesToUpload.length !== files.length) {
      setError("Some files were already uploaded and have been skipped.");
    }

    // Helper function to upload a single file with retry logic
    const uploadSingleFile = async (file, retryCount = 0) => {
      const maxRetries = 3;

      try {
        const result = await UploadFile({ file });
        return {
          name: file.name,
          url: result.file_url,
          size: file.size,
          success: true,
        };
      } catch (error) {
        console.error(
          `Upload attempt ${retryCount + 1} failed for ${file.name}:`,
          error
        );

        // Check if it's a timeout or database error that might succeed on retry
        const isRetryableError =
          error.message &&
          (error.message.includes("DatabaseTimeout") ||
            error.message.includes("timeout") ||
            error.message.includes("connection") ||
            error.message.includes("544")); // Example: connection reset by peer

        if (isRetryableError && retryCount < maxRetries) {
          // Wait a bit before retrying (exponential backoff)
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, delay));
          return uploadSingleFile(file, retryCount + 1);
        }

        return {
          name: file.name,
          size: file.size,
          success: false,
          error: error.message || "Upload failed",
        };
      }
    };

    try {
      // Upload files one by one to avoid overwhelming the system
      const successfulUploads = [];
      const failedUploads = [];

      for (const file of newFilesToUpload) {
        const result = await uploadSingleFile(file);

        if (result.success) {
          successfulUploads.push(result);
        } else {
          failedUploads.push(result);
        }
      }

      // Add successful uploads to the list
      if (successfulUploads.length > 0) {
        setUploadedFiles((prev) => [
          ...prev,
          ...successfulUploads.map((f) => ({
            name: f.name,
            url: f.url,
            size: f.size,
          })),
        ]);
      }

      // Handle errors
      if (failedUploads.length > 0) {
        const failedFileNames = failedUploads.map((f) => f.name).join(", ");
        const hasTimeoutError = failedUploads.some(
          (f) =>
            f.error &&
            (f.error.includes("DatabaseTimeout") || f.error.includes("timeout"))
        );

        if (hasTimeoutError) {
          setError(
            `Upload timeout occurred for: ${failedFileNames}. This is usually temporary - please try uploading these files again in a few moments.`
          );
        } else {
          setError(
            `Failed to upload: ${failedFileNames}. Please check your internet connection and try again.`
          );
        }
      } else if (successfulUploads.length > 0) {
        // Clear any previous errors if all uploads in this batch succeeded and there were successful uploads
        setError("");
      } else if (
        newFilesToUpload.length > 0 &&
        successfulUploads.length === 0
      ) {
        // If there were files to upload, but none succeeded
        setError(
          "All selected files failed to upload. Please check your internet connection and try again."
        );
      }
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
      setError("An unexpected error occurred during upload. Please try again.");
    }

    setIsUploading(false);
  };

  const mapScoresToCanonicalNames = async (scores) => {
    try {
      const user = await User.me();
      const allUserDefinitions = await TestSubtestDefinition.filter({
        created_by: user.email,
      });
      const allSystemDefinitions = await TestSubtestDefinition.filter({
        is_system_template: true,
      });

      const normalizeName = (name) =>
        (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

      const findDefinition = (testName) => {
        const normalizedTestName = normalizeName(testName);
        let definitions = [...allUserDefinitions, ...allSystemDefinitions];

        // Prioritize exact match
        let match = definitions.find(
          (def) => normalizeName(def.test_name) === normalizedTestName
        );
        if (match) return match;

        // Then alias match
        match = definitions.find((def) =>
          def.test_aliases?.some(
            (alias) => normalizeName(alias) === normalizedTestName
          )
        );
        if (match) return match;

        // Finally, fuzzy match
        return definitions.find((def) => {
          const defName = normalizeName(def.test_name);
          return (
            defName.includes(normalizedTestName) ||
            normalizedTestName.includes(defName)
          );
        });
      };

      const testDefinitionsCache = {};
      const mappedScores = scores.map((score) => {
        if (!testDefinitionsCache[score.test_name]) {
          testDefinitionsCache[score.test_name] = findDefinition(
            score.test_name
          );
        }
        const definition = testDefinitionsCache[score.test_name];

        if (definition && definition.subtests) {
          const normalizedSubtestName = normalizeName(score.subtest_name);
          const subtestDef = definition.subtests.find(
            (st) =>
              normalizeName(st.canonical_name) === normalizedSubtestName ||
              st.aliases?.some(
                (alias) => normalizeName(alias) === normalizedSubtestName
              )
          );

          if (subtestDef) {
            return {
              ...score,
              canonical_name: subtestDef.canonical_name,
              display_name: subtestDef.display_name,
            };
          }
        }
        return score; // Return original score if no match
      });

      return mappedScores;
    } catch (error) {
      console.error("Error mapping scores to canonical names:", error);
      return scores; // Return original scores on error
    }
  };

  const handleProcessFiles = async () => {
    setIsProcessing(true);
    setError("");
    setWarnings([]);

    const user = await User.me();
    // Default to true if the preference is not explicitly set
    const useAiDescriptorsPreference =
      user.use_ai_descriptors !== undefined ? user.use_ai_descriptors : true;

    let extractedScores = []; // This will collect all raw extracted scores
    const newWarnings = [];

    // Fetch templates once before the loop
    const allTemplates = await ReportTemplate.list();

    // Refined extraction schema to better differentiate scaled subtest scores and standard composite scores
    const extractionSchema = {
      type: "object",
      properties: {
        tests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              test_name: {
                type: "string",
                description:
                  "The full name of the psychological test found in the document (e.g., Adverse Childhood Experiences Questionnaire, Generalized Anxiety Disorder-7, PTSD Checklist for DSM-5, etc.). Be precise. If the document contains multiple distinct tests, identify each one.",
              },
              scores: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    subtest_name: {
                      type: "string",
                      description:
                        "The name of the subtest, index, or score item (e.g., 'Total Score', 'Criterion B - Intrusion', 'Symptoms', 'Risk Level - Alcohol'). Use 'Total Score' for questionnaire totals.",
                    },
                    scaled_score: {
                      type: "number",
                      description:
                        "The scaled score (e.g., 1-19) or a raw score sum (e.g., PHQ-9 Total Score of 7).",
                    },
                    composite_score: {
                      type: "number",
                      description:
                        "The composite/standard score (e.g., 40-160) or a clinical summary total. If a score is a percentage, convert it to a number (e.g., '6%' becomes 6).",
                    },
                    percentile_rank: {
                      type: "number",
                      description:
                        "The percentile rank. If the score is a percentage, use that value.",
                    },
                    descriptor: {
                      type: "string",
                      description:
                        "The qualitative descriptor for the score (e.g., 'Average', 'Mild Anxiety', 'Minimal risk', 'Negative').",
                    },
                  },
                  required: ["subtest_name"],
                },
              },
            },
            required: ["test_name", "scores"],
          },
        },
      },
      required: ["tests"],
    };

    for (const file of uploadedFiles) {
      try {
        const result = await ExtractDataFromUploadedFile({
          file_url: file.url,
          json_schema: extractionSchema,
        });

        if (
          result.status === "success" &&
          result.output &&
          result.output.tests
        ) {
          const detectedTests = result.output.tests;

          for (const detectedTest of detectedTests) {
            const { test_name, scores } = detectedTest;

            const enrichedScores = scores.map((score) => ({
              ...score,
              test_name,
              source_file: file.name,
            }));

            extractedScores.push(...enrichedScores); // Accumulate all scores

            // --- REVISED AND CORRECTED TEMPLATE MATCHING LOGIC ---

            const isFlexibleMatch = (template, extractedTestName) => {
              if (!template.test_type || !extractedTestName) {
                return false;
              }
              const clean = (str) =>
                str
                  .toLowerCase()
                  .replace(/[^a-z0-9\s]/g, "")
                  .replace(/\s+/g, " ")
                  .trim();
              const cleanExtractedName = clean(extractedTestName);
              const cleanTemplateTestType = clean(template.test_type);
              if (!cleanTemplateTestType) return false;
              const templateTokens = cleanTemplateTestType.split(" ");
              return templateTokens.every((token) =>
                cleanExtractedName.includes(token)
              );
            };

            const findAnyMatch = (templates, currentTestName) => {
              return templates.some((template) =>
                isFlexibleMatch(template, currentTestName)
              );
            };

            // Corrected Hierarchy Filtering:
            // 1. User's personal templates (NOT system templates).
            const myPersonalTemplates = allTemplates.filter(
              (t) => t.created_by === user.email && !t.is_system_template
            );
            // 2. ALL system templates, regardless of creator.
            const allSystemTemplates = allTemplates.filter(
              (t) => t.is_system_template
            );

            // Check personal templates first.
            let templateFound = findAnyMatch(myPersonalTemplates, test_name);

            // If not found in personal, then check system templates.
            if (!templateFound) {
              templateFound = findAnyMatch(allSystemTemplates, test_name);
            }

            if (!templateFound) {
              const newWarning = `Warning: No report template found for "${test_name}". You can create one in the 'My Templates' page, or use the Reports page to select from similar templates.`;
              if (!newWarnings.includes(newWarning)) {
                newWarnings.push(newWarning);
              }
            }
            // --- END OF REVISED LOGIC ---
          }
        } else {
          // Fallback error if result.output.tests is not as expected
          throw new Error(
            result.details ||
              "Could not extract score data from file. The file may be unreadable or contain no relevant data."
          );
        }
      } catch (error) {
        console.error("Error processing file:", error);

        // Handle specific error types with user-friendly messages
        let errorMessage = `Failed to extract scores from "${file.name}".`;

        if (
          error.message &&
          error.message.includes("The document has no pages")
        ) {
          errorMessage = `"${file.name}" appears to be empty or corrupted. Please check the file and try uploading again.`;
        } else if (
          error.message &&
          error.message.includes("INVALID_ARGUMENT")
        ) {
          errorMessage = `"${file.name}" could not be processed. Please ensure it's a valid PDF, image, or document file with readable content.`;
        } else if (error.message && error.message.includes("BadRequestError")) {
          errorMessage = `"${file.name}" has a formatting issue that prevents processing. Please try re-saving or re-exporting the file.`;
        } else if (
          error.message &&
          error.message.includes("Could not extract score data from file")
        ) {
          // Specific case for the custom error thrown above
          errorMessage = `"${file.name}" could not be processed. The file may be unreadable or contain no relevant data.`;
        } else {
          errorMessage += ` Error details: ${error.message}`; // Include generic error message for debugging
        }

        setError(errorMessage);
        setIsProcessing(false);
        return;
      }
    }

    // Map scores to canonical names *after* all extraction is complete
    const canonicallyMappedScores = await mapScoresToCanonicalNames(
      extractedScores
    );

    // Apply descriptors based on the now-complete and mapped data
    const finalScoresWithDescriptors = canonicallyMappedScores.map((score) => {
      let finalDescriptor = "N/A";
      let finalPercentileRange = "";
      let customDescriptorApplied = false;

      // Step 1: Check for User Custom Descriptors (Highest Priority)
      const customDescriptor = userCustomDescriptors.find((desc) => {
        if (desc.score_type === "standard" && score.composite_score != null) {
          const compositeScore = parseFloat(score.composite_score);
          return (
            !isNaN(compositeScore) &&
            compositeScore >= desc.min_score &&
            (desc.max_score == null || compositeScore <= desc.max_score)
          );
        }
        if (desc.score_type === "scaled" && score.scaled_score != null) {
          const scaledScore = parseFloat(score.scaled_score);
          return (
            !isNaN(scaledScore) &&
            scaledScore >= desc.min_score &&
            (desc.max_score == null || scaledScore <= desc.max_score)
          );
        }
        if (desc.score_type === "percentile" && score.percentile_rank != null) {
          const percentileRank = parseFloat(score.percentile_rank);
          return (
            !isNaN(percentileRank) &&
            percentileRank >= desc.min_score &&
            (desc.max_score == null || percentileRank <= desc.max_score)
          );
        }
        return false;
      });

      if (customDescriptor) {
        finalDescriptor = customDescriptor.descriptor;
        finalPercentileRange =
          customDescriptor.percentile_range || finalPercentileRange;
        customDescriptorApplied = true;
      } else {
        // Step 2: Use System Descriptors or AI Descriptors based on preference
        let systemDescriptorInfo = null;

        // Try to get system descriptor first
        // Added checks for `!== ""` because scores might be extracted as empty strings
        if (score.percentile_rank != null && score.percentile_rank !== "") {
          systemDescriptorInfo = getDescriptorFromPercentile(
            score.percentile_rank
          );
        } else if (score.scaled_score != null && score.scaled_score !== "") {
          systemDescriptorInfo = getScaledScoreDescriptor(score.scaled_score);
        } else if (
          score.composite_score != null &&
          score.composite_score !== ""
        ) {
          systemDescriptorInfo = getDescriptorAndPercentile(
            score.composite_score
          );
        }

        if (systemDescriptorInfo && systemDescriptorInfo.descriptor !== "N/A") {
          finalDescriptor = systemDescriptorInfo.descriptor;
          finalPercentileRange = systemDescriptorInfo.percentile_range;
        } else if (
          useAiDescriptorsPreference &&
          score.descriptor &&
          score.descriptor !== "null" &&
          score.descriptor !== null
        ) {
          // Only use AI descriptor if preference is ON and AI provided a valid descriptor (not null or "null" string)
          finalDescriptor = score.descriptor;
          finalPercentileRange = score.percentile_range || finalPercentileRange;
        }
        // If nothing worked, finalDescriptor remains "N/A"
      }

      return {
        ...score,
        descriptor: finalDescriptor,
        percentile_range: finalPercentileRange,
        custom_descriptor_applied: customDescriptorApplied,
      };
    });

    setAllExtractedScores(finalScoresWithDescriptors);
    setWarnings(newWarnings);
    setHasProcessedFiles(true);
    setIsProcessing(false);
  };

  const handleUpdateScores = (updatedScores) => {
    setAllExtractedScores(updatedScores);
  };

  const learnFromExtractedScores = async (extractedScores) => {
    try {
      const user = await User.me();
      const testGroups = lodash.groupBy(extractedScores, "test_name");

      const normalizeForMatching = (name) => {
        if (!name) return "";
        return name
          .toLowerCase()
          .replace(/\b(v|5)\b/g, "5") // Normalize 'v' to '5'
          .replace(/\b(iv|4)\b/g, "4") // Normalize 'iv' to '4'
          .replace(/[^a-z0-9]/g, ""); // Remove all non-alphanumeric chars
      };

      for (const [testName, scores] of Object.entries(testGroups)) {
        const normalizedUploadName = normalizeForMatching(testName);
        const allUserDefinitions = await TestSubtestDefinition.filter({
          created_by: user.email,
        });

        let matchedDefinition = allUserDefinitions.find((def) => {
          if (normalizeForMatching(def.test_name) === normalizedUploadName) {
            return true;
          }
          if (
            def.test_aliases &&
            def.test_aliases.some(
              (alias) => normalizeForMatching(alias) === normalizedUploadName
            )
          ) {
            return true;
          }
          return false;
        });

        if (matchedDefinition) {
          // We have a Test Bank definition - map extracted scores to canonical names
          let currentSubtests = lodash.cloneDeep(
            matchedDefinition.subtests || []
          );
          let hasChanges = false;

          scores.forEach((score) => {
            const subtestName = score.subtest_name;
            if (!subtestName) return;

            const normalizedSubtestName = subtestName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

            // Check if this extracted subtest matches any existing canonical name or aliases
            const matchingSubtest = currentSubtests.find((subtest) => {
              // Check canonical_name match
              const normalizedCanonicalName = subtest.canonical_name
                ?.toLowerCase()
                .replace(/[^a-z0-9]/g, "");
              if (normalizedCanonicalName === normalizedSubtestName) {
                return true;
              }
              // Check aliases match
              if (
                subtest.aliases &&
                subtest.aliases.some(
                  (alias) =>
                    alias.toLowerCase().replace(/[^a-z0-9]/g, "") ===
                    normalizedSubtestName
                )
              ) {
                return true;
              }
              return false;
            });

            if (!matchingSubtest) {
              // This is a new subtest not defined in Test Bank - add it
              const fallbackCanonicalName = subtestName
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, "")
                .replace(/\s+/g, "_")
                .replace(/^_|_$/g, "");

              if (fallbackCanonicalName) {
                // Check if canonical name already exists (avoid duplicates)
                const existingByCanonical = currentSubtests.find(
                  (s) => s.canonical_name === fallbackCanonicalName
                );

                if (existingByCanonical) {
                  // Add as alias to existing canonical entry
                  const currentAliases = existingByCanonical.aliases || [];
                  if (!currentAliases.includes(subtestName)) {
                    existingByCanonical.aliases = [
                      ...currentAliases,
                      subtestName,
                    ];
                    hasChanges = true;
                  }
                } else {
                  // Create new subtest entry
                  currentSubtests.push({
                    canonical_name: fallbackCanonicalName,
                    display_name: subtestName,
                    aliases: [subtestName],
                    score_type: "standard", // Default
                    is_user_defined: false, // Mark as learned
                  });
                  hasChanges = true;
                }
              }
            }
          });

          if (hasChanges) {
            await TestSubtestDefinition.update(matchedDefinition.id, {
              subtests: currentSubtests,
            });
            console.log(
              `Updated Test Bank definition for '${matchedDefinition.test_name}' with newly detected subtests.`
            );
          }
        } else {
          // No Test Bank definition exists - create a new one
          const initialSubtests = [];
          const addedCanonicalNames = new Set();

          scores.forEach((score) => {
            const subtestName = score.subtest_name;
            if (!subtestName) return;

            const cleanName = subtestName
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "_")
              .replace(/^_|_$/g, "");

            if (cleanName && !addedCanonicalNames.has(cleanName)) {
              initialSubtests.push({
                canonical_name: cleanName,
                display_name: subtestName,
                aliases: [subtestName],
                score_type: "standard",
                is_user_defined: false,
              });
              addedCanonicalNames.add(cleanName);
            }
          });

          console.log(
            `Creating new Test Bank definition for '${testName}' with ${initialSubtests.length} detected subtests.`
          );
          await TestSubtestDefinition.create({
            test_name: testName,
            test_aliases: [testName],
            subtests: initialSubtests,
            created_by: user.email,
          });
        }
      }
      console.log(
        "Successfully processed scores using Test Bank canonical name mapping"
      );
    } catch (error) {
      console.error("Error in Test Bank mapping process:", error);
      // Don't throw the error - just log it so the assessment can still be saved
    }
  };

  const handleSaveAssessment = async () => {
    setIsSaving(true);
    setError("");

    try {
      await Assessment.create({
        client_first_name: clientInfo.first_name,
        client_last_name: clientInfo.last_name,
        gender: clientInfo.gender,
        date_of_birth: clientInfo.date_of_birth,
        subjective_pronoun: clientInfo.subjective_pronoun,
        objective_pronoun: clientInfo.objective_pronoun,
        possessive_pronoun: clientInfo.possessive_pronoun,
        test_date: testDate,
        file_urls: uploadedFiles.map((f) => f.url),
        extracted_scores: allExtractedScores,
        status: "processed",
        rater1_first_name: raterInfo.rater1_first_name || undefined,
        rater1_last_name: raterInfo.rater1_last_name || undefined,
        rater1_suffix: raterInfo.rater1_suffix || undefined,
        rater2_first_name: showRater2
          ? raterInfo.rater2_first_name || undefined
          : undefined,
        rater2_last_name: showRater2
          ? raterInfo.rater2_last_name || undefined
          : undefined,
        rater2_suffix: showRater2
          ? raterInfo.rater2_suffix || undefined
          : undefined,
      });

      await learnFromExtractedScores(allExtractedScores);
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving assessment:", error);
      setError("Failed to save assessment. Please try again.");
    }

    setIsSaving(false);
  };

  const removeFile = (fileName) => {
    const isLastFile =
      uploadedFiles.length === 1 && uploadedFiles[0].name === fileName;
    setUploadedFiles((prev) => prev.filter((f) => f.name !== fileName));
    const newAllExtractedScores = allExtractedScores.filter(
      (score) => score.source_file !== fileName
    ); // Filter OUT scores from removed file
    setAllExtractedScores(newAllExtractedScores);

    const newSelected = new Set(selectedScores);
    allExtractedScores.forEach((score) => {
      if (score.source_file === fileName) {
        const scoreKey = `${score.test_name}__${score.subtest_name}`;
        newSelected.delete(scoreKey);
      }
    });
    setSelectedScores(newSelected);

    if (isLastFile || newAllExtractedScores.length === 0) {
      setHasProcessedFiles(false);
      setWarnings([]);
      setSelectedScores(new Set());
    }
  };

  const handleToggleScoreSelection = (scoreKey) => {
    const newSelection = new Set(selectedScores);
    if (newSelection.has(scoreKey)) {
      newSelection.delete(scoreKey);
    } else {
      newSelection.add(scoreKey);
    }
    setSelectedScores(newSelection);
  };

  const handleToggleAllScores = (scoresForTest, testName) => {
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

  const handleDeleteSelectedScores = (scoreKeysToDelete) => {
    const newAllExtractedScores = allExtractedScores.filter((score) => {
      const key = `${score.test_name}__${score.subtest_name}`;
      return !scoreKeysToDelete.includes(key);
    });
    setAllExtractedScores(newAllExtractedScores);

    const newSelected = new Set(selectedScores);
    scoreKeysToDelete.forEach((key) => newSelected.delete(key));
    setSelectedScores(newSelected);

    if (newAllExtractedScores.length === 0) {
      setHasProcessedFiles(false);
      setWarnings([]);
    }
  };

  const groupedScores = lodash.groupBy(allExtractedScores, "test_name");

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="rounded-xl border-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Upload Assessment Files
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Upload and extract psychological assessment scores
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
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
                Client & Assessment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={clientInfo.first_name}
                    onChange={(e) =>
                      handleClientInfoChange("first_name", e.target.value)
                    }
                    placeholder="Enter first name"
                    className="rounded-lg border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={clientInfo.last_name}
                    onChange={(e) =>
                      handleClientInfoChange("last_name", e.target.value)
                    }
                    placeholder="Enter last name"
                    className="rounded-lg border-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Gender
                  </Label>
                  <select
                    id="gender"
                    value={clientInfo.gender}
                    onChange={(e) =>
                      handleClientInfoChange("gender", e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="nonbinary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={clientInfo.date_of_birth}
                    onChange={(e) =>
                      handleClientInfoChange("date_of_birth", e.target.value)
                    }
                    className="rounded-lg border-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="subjective"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Subjective Pronoun
                  </Label>
                  <Input
                    id="subjective"
                    value={clientInfo.subjective_pronoun}
                    onChange={(e) =>
                      handleClientInfoChange(
                        "subjective_pronoun",
                        e.target.value
                      )
                    }
                    placeholder="he, she, they"
                    className="rounded-lg border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="objective"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Objective Pronoun
                  </Label>
                  <Input
                    id="objective"
                    value={clientInfo.objective_pronoun}
                    onChange={(e) =>
                      handleClientInfoChange(
                        "objective_pronoun",
                        e.target.value
                      )
                    }
                    placeholder="him, her, them"
                    className="rounded-lg border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="possessive"
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Possessive Pronoun
                  </Label>
                  <Input
                    id="possessive"
                    value={clientInfo.possessive_pronoun}
                    onChange={(e) =>
                      handleClientInfoChange(
                        "possessive_pronoun",
                        e.target.value
                      )
                    }
                    placeholder="his, her, their"
                    className="rounded-lg border-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="testDate"
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Test Date
                </Label>
                <Input
                  id="testDate"
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="rounded-lg border-2"
                />
              </div>
            </CardContent>
          </Card>

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
                Rater Information (Optional)
              </CardTitle>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Add information for parents, guardians, or other raters who
                completed rating forms
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Rater 1
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rater1FirstName">First Name</Label>
                    <Input
                      id="rater1FirstName"
                      value={raterInfo.rater1_first_name}
                      onChange={(e) =>
                        setRaterInfo({
                          ...raterInfo,
                          rater1_first_name: e.target.value,
                        })
                      }
                      placeholder="Optional"
                      className="rounded-lg border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rater1LastName">Last Name</Label>
                    <Input
                      id="rater1LastName"
                      value={raterInfo.rater1_last_name}
                      onChange={(e) =>
                        setRaterInfo({
                          ...raterInfo,
                          rater1_last_name: e.target.value,
                        })
                      }
                      placeholder="Optional"
                      className="rounded-lg border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rater1Suffix">Suffix</Label>
                    <Input
                      id="rater1Suffix"
                      value={raterInfo.rater1_suffix}
                      onChange={(e) =>
                        setRaterInfo({
                          ...raterInfo,
                          rater1_suffix: e.target.value,
                        })
                      }
                      placeholder="Jr., Sr., III"
                      className="rounded-lg border-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showRater2"
                    checked={showRater2}
                    onChange={(e) => setShowRater2(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label
                    htmlFor="showRater2"
                    className="cursor-pointer"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Add Optional Rater 2
                  </Label>
                </div>

                {showRater2 && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <h4
                      className="font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Rater 2
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rater2FirstName">First Name</Label>
                        <Input
                          id="rater2FirstName"
                          value={raterInfo.rater2_first_name}
                          onChange={(e) =>
                            setRaterInfo({
                              ...raterInfo,
                              rater2_first_name: e.target.value,
                            })
                          }
                          placeholder="Optional"
                          className="rounded-lg border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rater2LastName">Last Name</Label>
                        <Input
                          id="rater2LastName"
                          value={raterInfo.rater2_last_name}
                          onChange={(e) =>
                            setRaterInfo({
                              ...raterInfo,
                              rater2_last_name: e.target.value,
                            })
                          }
                          placeholder="Optional"
                          className="rounded-lg border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rater2Suffix">Suffix</Label>
                        <Input
                          id="rater2Suffix"
                          value={raterInfo.rater2_suffix}
                          onChange={(e) =>
                            setRaterInfo({
                              ...raterInfo,
                              rater2_suffix: e.target.value,
                            })
                          }
                          placeholder="Jr., Sr., III"
                          className="rounded-lg border-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <FileUploadZone
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            disabled={
              !clientInfo.first_name.trim() || !clientInfo.last_name.trim()
            }
          />

          {uploadedFiles.length > 0 && (
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2 text-xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FileText
                    className="w-6 h-6"
                    style={{ color: "var(--secondary-blue)" }}
                  />
                  Uploaded Files ({uploadedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {file.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                {!hasProcessedFiles && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={handleProcessFiles}
                      disabled={isProcessing || uploadedFiles.length === 0}
                      className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                      }}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {isProcessing ? "Processing Files..." : "Process Files"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isProcessing && (
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardContent className="p-8 text-center">
                <Loader2
                  className="w-12 h-12 animate-spin mx-auto mb-4"
                  style={{ color: "var(--secondary-blue)" }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Processing Assessment Files
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  Extracting scores and analyzing content...
                </p>
              </CardContent>
            </Card>
          )}

          {hasProcessedFiles && allExtractedScores.length > 0 && (
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle
                      className="flex items-center gap-2 text-xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      Consolidated Scores
                    </CardTitle>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Review, edit, or delete extracted scores before saving the
                      assessment.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected ({selectedCount})
                          </Button>
                        )}
                      </div>
                      <ScoreReview
                        extractedData={{ test_name: testName, scores: scores }}
                        clientName={`${clientInfo.first_name} ${clientInfo.last_name}`}
                        onUpdateScores={handleUpdateScores}
                        allScores={allExtractedScores}
                        allowDelete={true}
                        isSaving={isSaving}
                        selectedScores={selectedScores}
                        onToggleScoreSelection={handleToggleScoreSelection}
                        onToggleAllScores={() =>
                          handleToggleAllScores(scores, testName)
                        }
                        onDeleteSelectedScores={handleDeleteSelectedScores}
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
                  <Button
                    onClick={handleSaveAssessment}
                    disabled={
                      isSaving ||
                      isProcessing ||
                      allExtractedScores.length === 0
                    }
                    className="px-8 py-3 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                    }}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? "Saving..." : "Save Final Assessment"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
