import type { ExtractedScore } from "../types/Assessment";

export const groupByTestName = (scores: ExtractedScore[]) => {
  return scores.reduce<Record<string, ExtractedScore[]>>((acc, item) => {
    const key = item.test_name;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
};

export const deepClone = <T>(obj: T): T => structuredClone(obj);

export const normalizeSubtest = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

export const canonicalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_|_$/g, "");

export const groupScoresByTest = (scores: ExtractedScore[]) => {
  const result: Record<string, any[]> = {};
  for (const s of scores) {
    if (!result[s.test_name]) result[s.test_name] = [];
    result[s.test_name].push(s);
  }
  return result;
};

export const processSubtests = (currentSubtests: any[], scores: any[]) => {
  let hasChanges = false;

  scores.forEach((score) => {
    const subtestName = score.subtest_name;
    if (!subtestName) return;

    const normalizedSubtestName = normalizeSubtest(subtestName);

    const matching = currentSubtests.find((s) => {
      const canonical = normalizeSubtest(s.canonical_name || "");
      if (canonical === normalizedSubtestName) return true;

      return (
        s.aliases?.some(
          (a: string) => normalizeSubtest(a) === normalizedSubtestName
        ) || false
      );
    });

    if (!matching) {
      const fallbackCanonical = canonicalizeName(subtestName);
      if (!fallbackCanonical) return;

      const existingCanonical = currentSubtests.find(
        (s) => s.canonical_name === fallbackCanonical
      );

      if (existingCanonical) {
        if (!existingCanonical.aliases.includes(subtestName)) {
          existingCanonical.aliases.push(subtestName);
          hasChanges = true;
        }
      } else {
        currentSubtests.push({
          canonical_name: fallbackCanonical,
          display_name: subtestName,
          aliases: [subtestName],
          score_type: "standard",
          is_user_defined: false,
        });
        hasChanges = true;
      }
    }
  });

  return { updatedSubtests: currentSubtests, hasChanges };
};

export const generateNewSubtests = (scores: any[]) => {
  const seen = new Set<string>();
  const list: any[] = [];

  scores.forEach((score) => {
    const name = score.subtest_name;
    if (!name) return;

    const canonical = canonicalizeName(name);
    if (!canonical || seen.has(canonical)) return;

    list.push({
      canonical_name: canonical,
      display_name: name,
      aliases: [name],
      score_type: "standard",
      is_user_defined: false,
    });

    seen.add(canonical);
  });

  return list;
};
