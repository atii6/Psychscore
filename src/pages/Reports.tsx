import React from "react";
// import { Assessment, ReportTemplate, User, GeneratedReport, TestSubtestDefinition } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Search,
  Eye,
  Loader2,
  Trash2,
  FileSearch,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ScoreViewerModal from "../components/reports/ScoreViewerModal";
import QuickViewReportModal from "../components/reports/QuickViewReportModal";
import useGetAllGeneratedReports from "@/hooks/generated-reports/useGetAllGeneratedReports";
import useGetAllAssessments from "@/hooks/assessments/useGetAllAssessments";
import type { AssessmentType } from "@/utilitites/types/Assessment";

// Helper function to evaluate conditional placeholders
const evaluateConditionalPlaceholder = (conditionalText, placeholderMap) => {
  // Format: {{IF:placeholder_name:operator:value:true_text:false_text}}
  // Note: placeholder_name here should be the raw name (e.g., "wais_iv_fsi_score" NOT "{{wais_iv_fsi_score}}")
  const conditionalRegex =
    /\{\{IF:([\w_]+):(>=|<=|>|<|==|!=):(\d+(?:\.\d+)?):([^:]*):([^}]*)\}\}/g; // Adjusted regex to allow empty true/false text

  return conditionalText.replace(
    conditionalRegex,
    (match, placeholderName, operator, thresholdValue, trueText, falseText) => {
      // Get the actual value from the placeholder map
      const placeholderKey = `{{${placeholderName}}}`;
      const actualValue = placeholderMap[placeholderKey];

      // If the placeholder doesn't exist or isn't a number, return the false text
      if (
        actualValue === undefined ||
        actualValue === null ||
        actualValue === ""
      ) {
        return falseText;
      }

      const numericValue = parseFloat(actualValue);
      const threshold = parseFloat(thresholdValue);

      if (isNaN(numericValue) || isNaN(threshold)) {
        return falseText;
      }

      // Evaluate the condition
      let conditionMet = false;
      switch (operator) {
        case ">=":
          conditionMet = numericValue >= threshold;
          break;
        case "<=":
          conditionMet = numericValue <= threshold;
          break;
        case ">":
          conditionMet = numericValue > threshold;
          break;
        case "<":
          conditionMet = numericValue < threshold;
          break;
        case "==":
          conditionMet = numericValue === threshold;
          break;
        case "!=":
          conditionMet = numericValue !== threshold;
          break;
        default:
          conditionMet = false;
      }

      return conditionMet ? trueText : falseText;
    }
  );
};

// Moved helper functions outside the component to avoid dependency issues
const getDescriptorFromPercentile = (percentileRank) => {
  const pr = parseFloat(percentileRank);
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
  return { descriptor: "Extremely Low", percentile_range: "1-2" };
};

// Helper function to add delays between API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry API calls with exponential backoff
const retryWithBackoff = async (fn, retries = 3, delayMs = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (error.message && error.message.includes("Rate limit") && retries > 0) {
      console.log(
        `Rate limit hit, retrying in ${delayMs}ms... (${retries} retries left)`
      );
      await delay(delayMs);
      return retryWithBackoff(fn, retries - 1, delayMs * 2);
    }
    throw error;
  }
};

export default function ReportsPage() {
  const [assessments, setAssessments] = React.useState<AssessmentType[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [viewingScores, setViewingScores] = React.useState(null);
  const [generatingId, setGeneratingId] = React.useState<string>("");
  const [reportCounts, setReportCounts] = React.useState({});
  const [quickViewReport, setQuickViewReport] = React.useState(null);
  const navigate = useNavigate();
  const { data: GeneratedReport } = useGetAllGeneratedReports();
  const { data: Assessment } = useGetAllAssessments();

  const handleQuickViewReport = React.useCallback(
    async (assessmentId: string) => {
      try {
        const reports = await retryWithBackoff(async () => {
          return GeneratedReport?.filter(
            (r) => r.assessment_id === assessmentId
          );
        });

        if (reports && reports.length > 0) {
          setQuickViewReport(reports[0]);
        } else {
          alert(
            "No reports found for this assessment. Please generate one first."
          );
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        alert("Error loading report. Please try again in a moment.");
      }
    },
    []
  );

  const generateScoreTable = React.useCallback(
    async (scores, testName, userPreferences) => {
      const themes = {
        neutral_gray: { headerBg: "#f3f4f6", border: "#e5e7eb" },
        soft_orange: { headerBg: "#fff7ed", border: "#fed7aa" },
        mint_green: { headerBg: "#f0fdf4", border: "#bbf7d0" },
        light_blue: { headerBg: "#dbeafe", border: "#93c5fd" },
      };

      const theme =
        themes[userPreferences?.report_table_theme_color] ||
        themes.neutral_gray;
      const showTitle = userPreferences?.report_table_show_title !== false;

      const getDisplayName = (name) => {
        if (!name) return "";
        return name.replace(/\s*\([A-Z0-9]+\)$/, "").trim();
      };

      let tableHtml = `
      <style>
        .score-table { border-collapse: collapse; width: 100%; font-family: sans-serif; margin-bottom: 20px; }
        .score-table th, .score-table td { border: 1px solid ${
          theme.border
        }; padding: 8px; text-align: left; }
        .score-table th { background-color: ${
          theme.headerBg
        }; font-weight: 600; }
        .score-table-caption { caption-side: top; text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 10px; color: #000 !important; }
        .subtest-row td:first-child { padding-left: 30px; }
        .index-row td { font-weight: bold; }
      </style>
      <table class="score-table">
        ${
          showTitle
            ? `<caption class="score-table-caption">${testName} Scores</caption>`
            : ""
        }
        <thead>
          <tr>
            <th>Subtest/Index</th>
            <th>Score</th>
            <th>Percentile Rank</th>
            <th>Descriptor</th>
          </tr>
        </thead>
    `;

      let tableBody = "<tbody>";
      scores.forEach((score) => {
        const descriptorInfo = score.descriptor
          ? { descriptor: score.descriptor }
          : getDescriptorFromPercentile(score.percentile_rank);
        const descriptor = descriptorInfo.descriptor;
        tableBody += `
        <tr>
          <td>${getDisplayName(score.subtest_name) || ""}</td>
          <td>${
            score.scaled_score !== null && score.scaled_score !== undefined
              ? score.scaled_score
              : score.composite_score !== null &&
                score.composite_score !== undefined
              ? score.composite_score
              : ""
          }</td>
          <td>${score.percentile_rank || ""}</td>
          <td>${descriptor}</td>
        </tr>
      `;
      });
      tableBody += "</tbody>";
      tableHtml += tableBody;

      tableHtml += `</table>`;
      return tableHtml;
    },
    []
  );

  const capitalizePronounsInSentences = React.useCallback((htmlText) => {
    if (!htmlText) return "";

    const pronouns = [
      "he",
      "she",
      "they",
      "him",
      "her",
      "his",
      "their",
      "them",
      "hers",
      "theirs",
    ];

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlText;

    // Function to process text nodes
    const processTextNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent;

        // Match pronouns at the very start of the text node content
        const startRegex = new RegExp(`^(${pronouns.join("|")})\\b`, "i");
        text = text.replace(startRegex, (match) => {
          return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
        });

        // Match pronouns that appear after sentence-ending punctuation, including the spaces.
        // The regex `(^|\\.\\s+|\\!\\s+|\\?\\s+)` ensures the punctuation and following spaces
        // are captured in the 'prefix' group. This makes the replacement robust.
        const regexAfterPunctuation = new RegExp(
          `(^|\\.\\s+|\\!\\s+|\\?\\s+)(${pronouns.join("|")})\\b`,
          "gi"
        );

        text = text.replace(regexAfterPunctuation, (match, prefix, pronoun) => {
          // 'prefix' contains the punctuation and spaces, 'pronoun' contains the matched pronoun.
          // Capitalize the pronoun and reassemble.
          return `${prefix}${pronoun.charAt(0).toUpperCase()}${pronoun
            .slice(1)
            .toLowerCase()}`;
        });

        node.textContent = text;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Recursively process child nodes, skipping script and style tags to avoid mangling internal code
        if (
          node.tagName.toLowerCase() !== "script" &&
          node.tagName.toLowerCase() !== "style"
        ) {
          Array.from(node.childNodes).forEach(processTextNode);
        }
      }
    };

    // Process all nodes starting from the temporary div
    processTextNode(tempDiv);

    return tempDiv.innerHTML;
  }, []);

  const proceedWithGeneration = React.useCallback(
    async (assessment, resolvedTemplates) => {
      try {
        const currentUser = await retryWithBackoff(async () => await User.me());
        const userPreferences = {
          report_table_theme_color:
            currentUser.report_table_theme_color || "neutral_gray",
          report_table_show_title:
            currentUser.report_table_show_title !== false,
          report_font_family:
            currentUser.report_font_family || "Times New Roman",
          report_header_content: currentUser.report_header_content || "",
          report_footer_content: currentUser.report_footer_content || "",
        };

        let combinedReportContent = "";
        let hasContent = false;

        for (const testName of Object.keys(resolvedTemplates)) {
          const template = resolvedTemplates[testName];

          if (
            !template ||
            !template.template_content ||
            template.template_content.trim().length === 0
          ) {
            console.warn(
              `No valid template or empty content for test: ${testName}. Skipping.`
            );
            combinedReportContent += `<div><h3>${testName}</h3><p><em>A report could not be generated for this test as no matching template with content was found.</em></p></div><hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;"/>`;
            continue;
          }

          hasContent = true;
          const scoresForTest = assessment.extracted_scores.filter(
            (s) => s.test_name === testName
          );
          const scoreTableHtml = await generateScoreTable(
            scoresForTest,
            testName,
            userPreferences
          );

          const placeholderMap = {
            "{{client_first_name}}": assessment.client_first_name || "",
            "{{client_last_name}}": assessment.client_last_name || "",
            "{{subjective_pronoun}}": assessment.subjective_pronoun || "they",
            "{{objective_pronoun}}": assessment.objective_pronoun || "them",
            "{{possessive_pronoun}}": assessment.possessive_pronoun || "their",
            "{{test_name}}": testName,
            "{{test_date}}": format(
              new Date(assessment.test_date || Date.now()),
              "MMMM d, yyyy"
            ),
            "{{score_table}}": scoreTableHtml,
          };

          scoresForTest.forEach((score) => {
            if (score.canonical_name) {
              const cName = score.canonical_name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "_");
              const scoreValue =
                score.scaled_score != null
                  ? score.scaled_score
                  : score.composite_score;
              placeholderMap[`{{${cName}_score}}`] = scoreValue ?? "";
              placeholderMap[`{{${cName}_percentile}}`] =
                score.percentile_rank ?? "";
              placeholderMap[`{{${cName}_descriptor}}`] =
                score.descriptor ?? "";
            }
          });

          let finalContent = template.template_content;

          // Step 1: Evaluate conditional placeholders FIRST
          finalContent = evaluateConditionalPlaceholder(
            finalContent,
            placeholderMap
          );

          // Step 2: Replace regular placeholders
          for (const [key, value] of Object.entries(placeholderMap)) {
            if (finalContent.includes(key)) {
              finalContent = finalContent.replaceAll(key, value ?? "");
            }
          }

          // Step 3: Capitalize pronouns after periods (enhanced to handle HTML)
          finalContent = capitalizePronounsInSentences(finalContent);

          combinedReportContent += `<div>${finalContent}</div><hr style="margin: 2rem 0; border: none; border-top: 1px solid #e2e8f0;"/>`;
        }

        if (!hasContent) {
          throw new Error(
            "No content was generated - no templates with content were found or matched."
          );
        }

        const fontFamily = userPreferences.report_font_family;
        const headerContent = userPreferences.report_header_content
          ? `<div style="font-family: '${fontFamily}', serif; margin-bottom: 2rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem;">${userPreferences.report_header_content}</div>`
          : "";
        const footerContent = userPreferences.report_footer_content
          ? `<div style="font-family: '${fontFamily}', serif; margin-top: 2rem; border-top: 1px solid #e5e8eb; padding-top: 1rem;">${userPreferences.report_footer_content}</div>`
          : "";

        const finalReportContent = `<div style="font-family: '${fontFamily}', serif;">${headerContent}${combinedReportContent}${footerContent}</div>`;

        // const report = await retryWithBackoff(async () => {
        //   return await GeneratedReport.create({
        //     assessment_id: assessment.id,
        //     template_id: null,
        //     report_content: finalReportContent,
        //     report_title: `Psychological Report for ${assessment.client_first_name} ${assessment.client_last_name}`,
        //     client_name: `${assessment.client_first_name} ${assessment.client_last_name}`,
        //   });
        // });

        if (assessment.status === "processed") {
          // await retryWithBackoff(async () => {
          //   return await Assessment.update(assessment.id, {
          //     status: "report_generated",
          //   });
          // });
        }

        setIsLoading(true);
        const assessmentData = Assessment;
        setAssessments(assessmentData || []);

        const allReports = GeneratedReport;
        // const reportCountsByAssessment = lodash.countBy(
        //   allReports,
        //   "assessment_id"
        // );
        // const finalCounts = assessmentData.reduce((acc, assess) => {
        //   acc[assess.id] = reportCountsByAssessment[assess.id] || 0;
        //   return acc;
        // }, {});
        setReportCounts(GeneratedReport?.length || 0);
        setIsLoading(false);
        navigate(createPageUrl(`ViewReport?id=${report.id}`));
      } catch (error) {
        console.error("Report generation error:", error);
        throw error;
      }
    },
    [
      navigate,
      generateScoreTable,
      capitalizePronounsInSentences,
      setAssessments,
      setReportCounts,
      setIsLoading,
    ]
  );

  const handleAutoGenerateReport = React.useCallback(
    async (assessment: AssessmentType) => {
      console.log("=== STARTING REPORT GENERATION ===");
      console.log("Assessment ID:", assessment.id);
      console.log("Assessment extracted_scores:", assessment.extracted_scores);

      setGeneratingId(assessment.id || "");

      try {
        const user = await retryWithBackoff(async () => await User.me());
        console.log("User loaded:", user.email);

        // Load all templates
        // const userTemplates = await retryWithBackoff(async () => {
        //   return await ReportTemplate.filter({
        //     created_by: user.email,
        //     is_system_template: false,
        //   });
        // });

        await delay(300);
        // const systemTemplates = await retryWithBackoff(async () => {
        //   return await ReportTemplate.filter({ is_system_template: true });
        // });

        // Load all test bank definitions for canonical name lookup
        // const allUserDefinitions = await retryWithBackoff(async () => {
        //   return await TestSubtestDefinition.filter({ created_by: user.email });
        // });

        await delay(200);
        // const allSystemDefinitions = await retryWithBackoff(async () => {
        //   return await TestSubtestDefinition.filter({
        //     is_system_template: true,
        //   });
        // });

        // console.log("Templates loaded:");
        // console.log("- User templates:", userTemplates.length);
        // console.log("- System templates:", systemTemplates.length);
        // console.log("- User Test Bank definitions:", allUserDefinitions.length);
        // console.log(
        //   "- System Test Bank definitions:",
        //   allSystemDefinitions.length
        // );

        const testNames = [
          ...new Set(
            assessment.extracted_scores?.map(
              (s: Record<string, any>) => s.test_name
            ) || []
          ),
        ].filter(Boolean);
        console.log("Test names to process:", testNames);

        if (testNames.length === 0) {
          throw new Error(
            "No test names found in assessment scores. Cannot generate report."
          );
        }

        const resolvedTemplates = {};

        // Helper function to normalize names for matching
        const normalizeForMatching = (name: string) => {
          if (!name) return "";
          return name.toLowerCase().replace(/[^a-z0-9]/g, "");
        };

        // Helper function to calculate similarity score for fuzzy matching
        const calculateSimilarityScore = (str1: string, str2: string) => {
          const longer = str1.length > str2.length ? str1 : str2;
          const shorter = str1.length > str2.length ? str2 : str1;

          if (longer.length === 0) return 0;

          // Count matching characters in order
          let matchCount = 0;
          let shorterIndex = 0;
          for (
            let i = 0;
            i < longer.length && shorterIndex < shorter.length;
            i++
          ) {
            if (longer[i] === shorter[shorterIndex]) {
              matchCount++;
              shorterIndex++;
            }
          }

          return matchCount / longer.length;
        };

        for (const rawTestName of testNames) {
          console.log(`\n=== Processing test: ${rawTestName} ===`);

          // STEP 1: Find canonical test name via Test Bank using deterministic, multi-pass strategy
          const normalizedRawName = normalizeForMatching(rawTestName);
          console.log(`Normalized raw name: "${normalizedRawName}"`);

          // Sort all Test Bank definitions alphabetically by test_name for deterministic ordering
          const allTestDefs = [
            ...allUserDefinitions,
            ...allSystemDefinitions,
          ].sort((a, b) => a.test_name.localeCompare(b.test_name));

          console.log(
            `Checking ${allTestDefs.length} Test Bank definitions (sorted alphabetically)`
          );

          // PASS 1: Look for PERFECT matches (exact match on test_name or any alias)
          let perfectMatchDef = null;
          for (const testDef of allTestDefs) {
            const normalizedTestDefName = normalizeForMatching(
              testDef.test_name
            );

            // Check exact match on test_name
            if (normalizedTestDefName === normalizedRawName) {
              console.log(
                `  ✓✓✓ PERFECT MATCH on test_name: "${testDef.test_name}"`
              );
              perfectMatchDef = testDef;
              break;
            }

            // Check exact match on any alias
            if (testDef.test_aliases && testDef.test_aliases.length > 0) {
              for (const alias of testDef.test_aliases) {
                if (normalizeForMatching(alias) === normalizedRawName) {
                  console.log(
                    `  ✓✓✓ PERFECT MATCH on alias: "${alias}" -> "${testDef.test_name}"`
                  );
                  perfectMatchDef = testDef;
                  break;
                }
              }
              if (perfectMatchDef) break;
            }
          }

          let canonicalTestName = null;

          if (perfectMatchDef) {
            canonicalTestName = perfectMatchDef.test_name;
            console.log(
              `  → Using PERFECT match for canonical name: "${canonicalTestName}"`
            );
          } else {
            // PASS 2: No perfect match found - evaluate ALL definitions for fuzzy matching
            console.log(
              `  No perfect match found. Evaluating fuzzy matches...`
            );

            let bestFuzzyMatch = null;
            let bestFuzzyScore = 0;

            for (const testDef of allTestDefs) {
              const normalizedTestDefName = normalizeForMatching(
                testDef.test_name
              );

              // Only consider fuzzy match if both strings are long enough
              if (
                normalizedTestDefName.length > 3 &&
                normalizedRawName.length > 3
              ) {
                // Check if one contains the other (substring match)
                if (
                  normalizedTestDefName.includes(normalizedRawName) ||
                  normalizedRawName.includes(normalizedTestDefName)
                ) {
                  const score = calculateSimilarityScore(
                    normalizedTestDefName,
                    normalizedRawName
                  );
                  console.log(
                    `    Fuzzy candidate: "${
                      testDef.test_name
                    }" (score: ${score.toFixed(2)})`
                  );

                  if (score > bestFuzzyScore) {
                    bestFuzzyScore = score;
                    bestFuzzyMatch = testDef;
                  }
                }
              }
            }

            if (bestFuzzyMatch && bestFuzzyScore > 0.3) {
              // Require at least 30% similarity
              canonicalTestName = bestFuzzyMatch.test_name;
              console.log(
                `  → Using BEST FUZZY match for canonical name: "${canonicalTestName}" (score: ${bestFuzzyScore.toFixed(
                  2
                )})`
              );
            } else {
              canonicalTestName = rawTestName;
              console.log(
                `  → No strong match found. Using raw name as canonical: "${rawTestName}"`
              );
            }
          }

          // STEP 2: Find template using the now-reliable canonical test name
          const normalizedCanonicalName =
            normalizeForMatching(canonicalTestName);
          console.log(
            `\nSearching for templates matching normalized canonical name: "${normalizedCanonicalName}"`
          );

          // More precise template matching using canonical name
          const matchingUserTemplates = userTemplates.filter((template) => {
            const normalizedTestType = normalizeForMatching(template.test_type);

            // Exact match on normalized strings first
            if (normalizedTestType === normalizedCanonicalName) {
              console.log(
                `  ✓ EXACT NORMALIZED USER template match: "${template.template_name}" (test_type: "${template.test_type}")`
              );
              return true;
            }

            // Substring match on normalized strings as fallback
            if (
              normalizedTestType.length > 2 &&
              normalizedCanonicalName.length > 2 &&
              (normalizedTestType.includes(normalizedCanonicalName) ||
                normalizedCanonicalName.includes(normalizedTestType))
            ) {
              console.log(
                `  ✓ SUBSTRING NORMALIZED USER template match: "${template.template_name}" (test_type: "${template.test_type}")`
              );
              return true;
            }

            return false;
          });

          const matchingSystemTemplates = systemTemplates.filter((template) => {
            const normalizedTestType = normalizeForMatching(template.test_type);

            // Exact match on normalized strings first
            if (normalizedTestType === normalizedCanonicalName) {
              console.log(
                `  ✓ EXACT NORMALIZED SYSTEM template match: "${template.template_name}" (test_type: "${template.test_type}")`
              );
              return true;
            }

            // Substring match on normalized strings as fallback
            if (
              normalizedTestType.length > 2 &&
              normalizedCanonicalName.length > 2 &&
              (normalizedTestType.includes(normalizedCanonicalName) ||
                normalizedCanonicalName.includes(normalizedTestType))
            ) {
              console.log(
                `  ✓ SUBSTRING NORMALIZED SYSTEM template match: "${template.template_name}" (test_type: "${template.test_type}")`
              );
              return true;
            }

            return false;
          });

          console.log(
            `  Found ${matchingUserTemplates.length} user templates and ${matchingSystemTemplates.length} system templates`
          );

          // Prioritize user templates over system templates
          if (matchingUserTemplates.length > 0) {
            const selectedTemplate = matchingUserTemplates[0];
            resolvedTemplates[rawTestName] = selectedTemplate; // Use raw test name as key for consistency with score data
            console.log(
              `  → SELECTED USER template: "${
                selectedTemplate.template_name
              }" (has content: ${
                !!selectedTemplate.template_content &&
                selectedTemplate.template_content.trim().length > 0
              })`
            );
          } else if (matchingSystemTemplates.length > 0) {
            const selectedTemplate = matchingSystemTemplates[0];
            resolvedTemplates[rawTestName] = selectedTemplate; // Use raw test name as key
            console.log(
              `  → SELECTED SYSTEM template: "${
                selectedTemplate.template_name
              }" (has content: ${
                !!selectedTemplate.template_content &&
                selectedTemplate.template_content.trim().length > 0
              })`
            );
          } else {
            resolvedTemplates[rawTestName] = null;
            console.log(
              `  → NO TEMPLATE FOUND for canonical name "${canonicalTestName}"`
            );
          }
        }

        console.log("\n=== Final resolved templates ===");
        console.log(resolvedTemplates);

        // Check if we have at least one valid template with content
        const hasValidTemplate = Object.values(resolvedTemplates).some(
          (template) =>
            template &&
            template.template_content &&
            template.template_content.trim().length > 0
        );

        if (!hasValidTemplate) {
          console.error("No valid templates found with content!");

          // Show detailed error message to help user understand what to do
          const allAvailableTemplates = [...userTemplates, ...systemTemplates];
          const availableTestTypes = [
            ...new Set(allAvailableTemplates.map((t) => t.test_type)),
          ].filter(Boolean);

          let errorMessage = `No matching templates with content were found for the following tests: ${testNames.join(
            ", "
          )}.\n\n`;
          errorMessage += `The system first tried to resolve the test names using your Test Bank definitions. Then, it looked for report templates whose "Test Type" field matches these resolved names (e.g., "WAIS-IV", "WISC-V").\n\n`;

          if (availableTestTypes.length > 0) {
            errorMessage += `Available template test types: ${availableTestTypes.join(
              ", "
            )}.`;
          } else {
            errorMessage += `You currently have no templates available. Please create a new template first, ensuring its "Test Type" matches your expected assessment tests.`;
          }

          throw new Error(errorMessage);
        }

        await proceedWithGeneration(assessment, resolvedTemplates);
      } catch (error) {
        console.error("Report generation failed:", error);
        if (error.message && error.message.includes("Rate limit")) {
          alert(
            `Rate limit exceeded. Please wait a moment before trying again.`
          );
        } else {
          alert(`Failed to generate report:\n\n${error.message}`);
        }
      } finally {
        setGeneratingId(null);
      }
    },
    [proceedWithGeneration]
  );

  const handleDeleteAssessment = React.useCallback(
    async (assessmentId) => {
      try {
        await retryWithBackoff(() => Assessment.delete(assessmentId));

        setIsLoading(true);
        // Re-fetch all data efficiently after deletion
        const [assessmentData, reportData] = await Promise.all([
          retryWithBackoff(() => Assessment.list("-created_date")),
          retryWithBackoff(() => GeneratedReport.list()),
        ]);

        setAssessments(assessmentData);

        const reportCountsByAssessment = lodash.countBy(
          reportData,
          "assessment_id"
        );
        const finalCounts = assessmentData.reduce((acc, assess) => {
          acc[assess.id] = reportCountsByAssessment[assess.id] || 0;
          return acc;
        }, {});

        setReportCounts(finalCounts);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to delete assessment:", error);
        if (error.message && error.message.includes("Rate limit")) {
          alert(
            "Rate limit exceeded. Please wait a moment before trying again."
          );
        } else {
          alert("Failed to delete assessment. Please try again.");
        }
      }
    },
    [setAssessments, setReportCounts, setIsLoading]
  );

  React.useEffect(() => {
    const cleanupAndLoadData = async () => {
      setIsLoading(true);
      let reportsAfterCleanup = [];

      try {
        // Calculate 30 days ago timestamp
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        console.log(
          "Cleanup threshold date:",
          new Date(thirtyDaysAgo).toISOString()
        );

        const allReports = await retryWithBackoff(() => GeneratedReport.list());
        console.log(`Found ${allReports.length} total reports`);

        reportsAfterCleanup = [...allReports];

        // Filter reports older than 30 days
        const reportsToDelete = allReports.filter((report) => {
          const reportDate = new Date(report.created_date).getTime();
          const isExpired = reportDate < thirtyDaysAgo;

          if (isExpired) {
            const daysOld = Math.floor(
              (Date.now() - reportDate) / (24 * 60 * 60 * 1000)
            );
            console.log(
              `Report ${report.id} is ${daysOld} days old (created: ${new Date(
                report.created_date
              ).toISOString()}) - EXPIRED`
            );
          }

          return isExpired;
        });

        console.log(
          `Found ${reportsToDelete.length} expired reports to delete`
        );

        if (reportsToDelete.length > 0) {
          for (let i = 0; i < reportsToDelete.length; i++) {
            const report = reportsToDelete[i];
            if (i > 0 && i % 3 === 0) await delay(500); // Delay to avoid hammering delete endpoint

            try {
              console.log(
                `Deleting expired report ${report.id} (${
                  report.report_title || "No Title"
                })`
              );
              await retryWithBackoff(() => GeneratedReport.delete(report.id));
              reportsAfterCleanup = reportsAfterCleanup.filter(
                (r) => r.id !== report.id
              );
              console.log(`Successfully deleted report ${report.id}`);
            } catch (error) {
              // If the error is a 404 (not found), it means another process already deleted it. This is safe to ignore.
              if (
                error instanceof Error &&
                error.message &&
                (error.message.includes("not found") ||
                  error.message.includes("404"))
              ) {
                console.warn(
                  `Report ${report.id} already deleted (received 404 or 'not found'). Removing from list.`
                );
                reportsAfterCleanup = reportsAfterCleanup.filter(
                  (r) => r.id !== report.id
                ); // Ensure it's removed from our local list if delete failed because it was gone
              } else {
                // For any other error, log it as a real problem.
                console.error(
                  `Error deleting expired report ${report.id}:`,
                  error
                );
              }
            }
          }
        } else {
          console.log("No expired reports found.");
        }
      } catch (error) {
        console.error("Error during report cleanup:", error);
      }

      const assessmentData = await retryWithBackoff(() =>
        Assessment.list("-created_date")
      );
      setAssessments(assessmentData);

      // Efficiently calculate report counts
      const reportCountsByAssessment = lodash.countBy(
        reportsAfterCleanup,
        "assessment_id"
      );
      const finalCounts = assessmentData.reduce((acc, assess) => {
        acc[assess.id] = reportCountsByAssessment[assess.id] || 0;
        return acc;
      }, {});

      setReportCounts(finalCounts);
      setIsLoading(false);

      const urlParams = new URLSearchParams(window.location.search);
      const generateId = urlParams.get("generate");
      if (generateId) {
        const assessment = assessmentData.find((a) => a.id === generateId);
        if (assessment) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          setTimeout(() => {
            handleAutoGenerateReport(assessment);
          }, 500); // small delay to allow state to settle
        }
      }
    };

    cleanupAndLoadData();
  }, [handleAutoGenerateReport, setAssessments, setReportCounts, setIsLoading]);

  const filteredAssessments = assessments.filter((assessment) => {
    const clientFullName = `${assessment.client_first_name || ""} ${
      assessment.client_last_name || ""
    }`;
    const testNames = [
      ...new Set(assessment.extracted_scores?.map((s) => s.test_name) || []),
    ].join(", ");
    const matchesSearch =
      clientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testNames.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Assessment Reports
            </h1>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
              Generate and manage psychological assessment reports
            </p>
          </div>
        </div>

        <Card
          className="border-0 shadow-lg rounded-2xl mb-6"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-3 w-4 h-4"
                  style={{ color: "var(--text-secondary)" }}
                />
                <Input
                  placeholder="Search by client name or test type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 rounded-lg border-2"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200"
              >
                <option value="all">All Status</option>
                <option value="processed">Ready for Report</option>
                <option value="report_generated">Report Generated</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredAssessments.map((assessment) => {
            const testNames = [
              ...new Set(
                assessment.extracted_scores?.map(
                  (s: Record<string, any>) => s.test_name
                ) || []
              ),
            ].join(", ");
            const hasReport = reportCounts[assessment.id] > 0;

            return (
              <Card
                key={assessment.id}
                className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "var(--light-blue)" }}
                      >
                        <FileText
                          className="w-6 h-6"
                          style={{ color: "var(--secondary-blue)" }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold text-lg"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {assessment.client_first_name}{" "}
                          {assessment.client_last_name}
                        </h3>
                        <p style={{ color: "var(--text-secondary)" }}>
                          {testNames} •{" "}
                          {format(
                            new Date(assessment.created_date),
                            "MMM d, yyyy"
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            className={`font-medium ${
                              assessment.status === "report_generated"
                                ? "bg-green-100 text-green-800"
                                : assessment.status === "processed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {assessment.status === "report_generated" &&
                            reportCounts[assessment.id] > 0
                              ? `Report Generated (${
                                  reportCounts[assessment.id]
                                })`
                              : assessment.status.replace("_", " ")}
                          </Badge>
                          {assessment.extracted_scores && (
                            <span
                              className="text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {assessment.extracted_scores.length} scores
                              extracted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewingScores(assessment)}
                      >
                        <Eye className="w-4 h-4" />
                        View Scores
                      </Button>
                      {hasReport && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleQuickViewReport(assessment.id)}
                        >
                          <FileSearch className="w-4 h-4" />
                          Quick View
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[var(--card-background)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Assessment?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the assessment for
                              "{assessment.client_first_name}{" "}
                              {assessment.client_last_name}"? This action cannot
                              be undone and will also delete any generated
                              reports.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteAssessment(assessment.id)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Assessment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        className="gap-2 text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))",
                        }}
                        disabled={
                          !["processed", "report_generated"].includes(
                            assessment.status
                          ) || generatingId === assessment.id
                        }
                        onClick={() => handleAutoGenerateReport(assessment)}
                      >
                        {generatingId === assessment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        {generatingId === assessment.id
                          ? "Generating..."
                          : assessment.status === "report_generated"
                          ? "Generate Again"
                          : "Generate Report"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredAssessments.length === 0 && !isLoading && (
            <Card
              className="border-0 shadow-lg rounded-2xl"
              style={{ backgroundColor: "var(--card-background)" }}
            >
              <CardContent className="p-12 text-center">
                <FileText
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ color: "var(--text-secondary)" }}
                />
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  No assessments found
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  Upload your first assessment to start generating reports
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <ScoreViewerModal
          assessment={viewingScores}
          isOpen={!!viewingScores}
          onClose={() => setViewingScores(null)}
        />
        <QuickViewReportModal
          report={quickViewReport}
          isOpen={!!quickViewReport}
          onClose={() => setQuickViewReport(null)}
        />
      </div>
    </div>
  );
}
