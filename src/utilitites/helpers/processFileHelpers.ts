import { ScoresType } from "@/pages/ManualEntry";
import { SCORE_TYPE } from "../constants";
import type { ExtractedScore } from "../types/Assessment";
import type { ReportTemplateType } from "../types/ReportTemplate";
import { TestDefinitionType } from "../types/TestSubtestDefinitions";
import {
  getDescriptorAndPercentile,
  getDescriptorFromPercentile,
  getScaledScoreDescriptor,
} from "./common";
import { UserScoreDescriptorType } from "../types/UserScoreDescriptor";
import { normalizeSubtest } from "./descriptorEvaluationHelpers";

export const cleanString = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Flexible matching for template detection
export const isFlexibleMatch = (
  template: ReportTemplateType,
  extractedTestName: string
) => {
  if (!template.test_type || !extractedTestName) return false;
  const templateTokens = cleanString(template.test_type).split(" ");
  return templateTokens.every((token) =>
    cleanString(extractedTestName).includes(token)
  );
};

export const findMatchingTemplate = (
  templates: ReportTemplateType[],
  testName: string
) => templates.some((t) => isFlexibleMatch(t, testName));

export const generateTemplateWarning = (testName: string) =>
  `Warning: No report template found for "${testName}". You can create one in the 'My Templates' page, or use the Reports page to select from similar templates.`;

// Apply descriptors based on user/system/AI
export const applyDescriptor = (
  score: ExtractedScore,
  userCustomDescriptors: UserScoreDescriptorType[],
  useAiDescriptors: boolean
) => {
  let finalDescriptor = "N/A";
  let finalPercentileRange = "";
  let customApplied = false;

  // 1. Check user custom descriptors
  const customDescriptor = userCustomDescriptors.find((desc) => {
    if (
      desc.score_type === SCORE_TYPE.STANDARD &&
      score.composite_score != null
    ) {
      const val = Number(score.composite_score);
      return (
        !isNaN(val) &&
        val >= desc.min_score &&
        (desc.max_score == null || val <= desc.max_score)
      );
    }
    if (desc.score_type === SCORE_TYPE.SCALED && score.scaled_score != null) {
      const val = score.scaled_score;
      return (
        !isNaN(val) &&
        val >= desc.min_score &&
        (desc.max_score == null || val <= desc.max_score)
      );
    }
    if (
      desc.score_type === SCORE_TYPE.PERCENTILE &&
      score.percentile_rank != null
    ) {
      const val = score.percentile_rank;
      return (
        !isNaN(val) &&
        val >= desc.min_score &&
        (desc.max_score == null || val <= desc.max_score)
      );
    }
    return false;
  });

  if (customDescriptor) {
    finalDescriptor = customDescriptor.descriptor;
    finalPercentileRange = customDescriptor.percentile_range || "";
    customApplied = true;
    return { finalDescriptor, finalPercentileRange, customApplied };
  }

  // 2. Apply system or AI descriptors
  // (assuming these are imported functions from your original code)
  let systemInfo = null;

  if (score.percentile_rank != null && score.percentile_rank !== 0) {
    systemInfo = getDescriptorFromPercentile(String(score.percentile_rank));
  } else if (score.scaled_score != null && score.scaled_score !== 0) {
    systemInfo = getScaledScoreDescriptor(score.scaled_score);
  } else if (score.composite_score != null && score.composite_score !== 0) {
    systemInfo = getDescriptorAndPercentile(score.composite_score);
  }

  if (systemInfo && systemInfo.descriptor !== "N/A") {
    finalDescriptor = systemInfo.descriptor;
    finalPercentileRange = systemInfo.percentile_range;
  } else if (
    useAiDescriptors &&
    score.descriptor &&
    score.descriptor !== "null" &&
    score.descriptor !== null
  ) {
    finalDescriptor = score.descriptor;
    finalPercentileRange = String(score.percentile_rank) || "";
  }

  return { finalDescriptor, finalPercentileRange, customApplied: false };
};

export const mapScoresToCanonicalNames = (
  scores: ExtractedScore[],
  TestSubtestDefinition: TestDefinitionType[]
): ExtractedScore[] => {
  try {
    const allUserDefinitions =
      TestSubtestDefinition?.filter((def) => !def.is_system_template) || [];
    const allSystemDefinitions =
      TestSubtestDefinition?.filter((def) => def.is_system_template) || [];

    const findDefinition = (testName: string) => {
      const normalizedTestName = normalizeSubtest(testName);
      const defs = [...allUserDefinitions, ...allSystemDefinitions];

      let exact = defs.find(
        (def) => normalizeSubtest(def.test_name) === normalizedTestName
      );
      if (exact) return exact;

      let alias = defs.find((def) =>
        def.test_aliases?.some(
          (alias) => normalizeSubtest(alias) === normalizedTestName
        )
      );
      if (alias) return alias;

      return defs.find((def) => {
        const dn = normalizeSubtest(def.test_name);
        return (
          dn.includes(normalizedTestName) || normalizedTestName.includes(dn)
        );
      });
    };

    return scores.map((score) => {
      const definition = findDefinition(score.test_name);

      if (!definition || !definition.subtests) return score;

      const normalizedSubtestName = normalizeSubtest(score.subtest_name);
      const subtest = definition.subtests.find(
        (st) =>
          normalizeSubtest(st.canonical_name) === normalizedSubtestName ||
          st.aliases?.some(
            (alias: string) => normalizeSubtest(alias) === normalizedSubtestName
          )
      );

      if (!subtest) return score;

      return {
        ...score,
        canonical_name: subtest.canonical_name,
        display_name: subtest.display_name,
      };
    });
  } catch (err) {
    console.error("Error mapping:", err);
    return scores;
  }
};
