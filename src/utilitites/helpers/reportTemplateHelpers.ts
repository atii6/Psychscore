import type { ReportTemplateType } from "../types/ReportTemplate";
import type { TestDefinitionType } from "../types/TestSubtestDefinitions";
import type { ExtractedScore } from "../types/Assessment";
import { format } from "date-fns";
import { getDescriptorFromPercentile, normalizeForMatching } from "./common";

export type PlaceholderMap = Record<string, string | number>;

export const evaluateConditionalPlaceholder = (
  conditionalText: string,
  placeholderMap: PlaceholderMap
) => {
  // Format: {{IF:placeholder_name:operator:value:true_text:false_text}}
  // Note: placeholder_name here should be the raw name (e.g., "wais_iv_fsi_score" NOT "{{wais_iv_fsi_score}}")
  const conditionalRegex =
    /\{\{IF:([\w_]+):(>=|<=|>|<|==|!=):(\d+(?:\.\d+)?):([^:]*):([^}]*)\}\}/g; // Adjusted regex to allow empty true/false text

  return conditionalText.replace(
    conditionalRegex,
    (match, placeholderName, operator, thresholdValue, trueText, falseText) => {
      // Get the actual value from the placeholder map
      const placeholderKey = `{{${placeholderName}}}`;
      const actualValue =
        placeholderMap[placeholderKey as keyof typeof placeholderMap];

      // If the placeholder doesn't exist or isn't a number, return the false text
      if (
        actualValue === undefined ||
        actualValue === null ||
        actualValue === ""
      ) {
        return falseText;
      }

      const numericValue = parseFloat(actualValue as string);
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

export const calculateSimilarityScore = (str1: string, str2: string) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 0;

  // Count matching characters in order
  let matchCount = 0;
  let shorterIndex = 0;
  for (let i = 0; i < longer.length && shorterIndex < shorter.length; i++) {
    if (longer[i] === shorter[shorterIndex]) {
      matchCount++;
      shorterIndex++;
    }
  }

  return matchCount / longer.length;
};

export const resolveCanonicalTestName = (
  rawName: string,
  allDefs: TestDefinitionType[]
): string => {
  const normalizedRaw = normalizeForMatching(rawName);

  // PASS 1: perfect match
  const perfect = allDefs.find((def) => {
    const normDef = normalizeForMatching(def.test_name);
    if (normDef === normalizedRaw) return true;

    return def.test_aliases?.some(
      (alias: string) => normalizeForMatching(alias) === normalizedRaw
    );
  });

  if (perfect) return perfect.test_name;

  // PASS 2: fuzzy
  let bestMatch = null;
  let bestScore = 0;

  for (const def of allDefs) {
    const normDef = normalizeForMatching(def.test_name);

    if (normDef.includes(normalizedRaw) || normalizedRaw.includes(normDef)) {
      const score = calculateSimilarityScore(normDef, normalizedRaw);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = def;
      }
    }
  }

  return bestMatch && bestScore > 0.3 ? bestMatch.test_name : rawName;
};

export const matchTemplateForTest = (
  canonicalName: string,
  userTemplates: ReportTemplateType[],
  systemTemplates: ReportTemplateType[]
) => {
  const normalized = normalizeForMatching(canonicalName);

  const filterMatch = (templates: ReportTemplateType[]) =>
    templates?.filter((t) => {
      const normType = normalizeForMatching(t.test_type);
      return (
        normType === normalized ||
        normType.includes(normalized) ||
        normalized.includes(normType)
      );
    }) ?? [];

  const userMatched = filterMatch(userTemplates);
  const systemMatched = filterMatch(systemTemplates);

  return userMatched[0] || systemMatched[0] || null;
};

export function getUserPreferences() {
  return {
    report_table_theme_color: "neutral_gray",
    report_table_show_title: true,
    report_font_family: "Times New Roman",
    report_header_content: "",
    report_footer_content: "",
  };
}

export function buildPlaceholderMap(
  assessment: any,
  testName: string,
  scoreTableHtml: string
): PlaceholderMap {
  return {
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
}

export function addScorePlaceholders(
  scoresForTest: ExtractedScore[],
  placeholderMap: PlaceholderMap
) {
  scoresForTest.forEach((score) => {
    if (!score.canonical_name) return;

    const cName = score.canonical_name.toLowerCase().replace(/[^a-z0-9]/g, "_");

    const scoreValue =
      score.scaled_score != null ? score.scaled_score : score.composite_score;

    placeholderMap[`{{${cName}_score}}`] = scoreValue ?? "";
    placeholderMap[`{{${cName}_percentile}}`] = score.percentile_rank ?? "";
    placeholderMap[`{{${cName}_descriptor}}`] = score.descriptor ?? "";
  });

  return placeholderMap;
}

export const capitalizePronounsInSentences = (htmlText: string) => {
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
  const processTextNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent;

      // Match pronouns at the very start of the text node content
      const startRegex = new RegExp(`^(${pronouns.join("|")})\\b`, "i");
      text =
        text &&
        text.replace(startRegex, (match) => {
          return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
        });

      // Match pronouns that appear after sentence-ending punctuation, including the spaces.
      // The regex `(^|\\.\\s+|\\!\\s+|\\?\\s+)` ensures the punctuation and following spaces
      // are captured in the 'prefix' group. This makes the replacement robust.
      const regexAfterPunctuation = new RegExp(
        `(^|\\.\\s+|\\!\\s+|\\?\\s+)(${pronouns.join("|")})\\b`,
        "gi"
      );

      text =
        text &&
        text.replace(regexAfterPunctuation, (match, prefix, pronoun) => {
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
        (node as HTMLElement | Element).tagName.toLowerCase() !== "script" &&
        (node as HTMLElement | Element).tagName.toLowerCase() !== "style"
      ) {
        Array.from(node.childNodes).forEach(processTextNode);
      }
    }
  };

  processTextNode(tempDiv);

  return tempDiv.innerHTML;
};

export function renderTestTemplate(
  templateContent: string,
  placeholderMap: PlaceholderMap
) {
  let final = templateContent;

  final = evaluateConditionalPlaceholder(final, placeholderMap);

  for (const [key, value] of Object.entries(placeholderMap)) {
    if (final.includes(key)) {
      final = final.replaceAll(key, (value as string) ?? "");
    }
  }

  return capitalizePronounsInSentences(final);
}

export function wrapFinalReport(
  content: string,
  prefs: ReturnType<typeof getUserPreferences>
) {
  const font = prefs.report_font_family;

  const header = prefs.report_header_content
    ? `<div style="font-family:'${font}', serif; margin-bottom:2rem; border-bottom:1px solid #e5e7eb; padding-bottom:1rem;">${prefs.report_header_content}</div>`
    : "";

  const footer = prefs.report_footer_content
    ? `<div style="font-family:'${font}', serif; margin-top:2rem; border-top:1px solid #e5e8eb; padding-top:1rem;">${prefs.report_footer_content}</div>`
    : "";

  return `<div style="font-family:'${font}', serif;">${header}${content}${footer}</div>`;
}

export const generateScoreTable = async (
  scores: ExtractedScore[],
  testName: string,
  userPreferences?: ReturnType<typeof getUserPreferences>
) => {
  const themes = {
    neutral_gray: { headerBg: "#f3f4f6", border: "#e5e7eb" },
    soft_orange: { headerBg: "#fff7ed", border: "#fed7aa" },
    mint_green: { headerBg: "#f0fdf4", border: "#bbf7d0" },
    light_blue: { headerBg: "#dbeafe", border: "#93c5fd" },
  };

  const theme =
    themes[userPreferences?.report_table_theme_color as keyof typeof themes] ||
    themes.neutral_gray;
  const showTitle = userPreferences?.report_table_show_title !== false;

  const getDisplayName = (name: string) => {
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
      : getDescriptorFromPercentile(String(score.percentile_rank));
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
};
