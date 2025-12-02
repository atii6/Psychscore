import type { AppUser } from "@/store/userStore";
import type { PlaceholdersType } from "@/utilitites/types/ReportTemplate";
import type { TestDefinitionType } from "@/utilitites/types/TestSubtestDefinitions";

const getStandardPlaceholders = (testType: string) => {
  // Only common placeholders - no longer hardcoded test-specific ones
  const commonPlaceholders = [
    {
      placeholder: "{{client_first_name}}",
      description: "Client's first name",
      data_source: "client_info",
    },
    {
      placeholder: "{{client_last_name}}",
      description: "Client's last name",
      data_source: "client_info",
    },
    {
      placeholder: "{{subjective_pronoun}}",
      description: "he/she/they",
      data_source: "client_info",
    },
    {
      placeholder: "{{objective_pronoun}}",
      description: "him/her/them",
      data_source: "client_info",
    },
    {
      placeholder: "{{possessive_pronoun}}",
      description: "his/her/their",
      data_source: "client_info",
    },
    {
      placeholder: "{{test_name}}",
      description: "Name of the test administered",
      data_source: "test_info",
    },
    {
      placeholder: "{{test_date}}",
      description: "Date test was administered",
      data_source: "test_info",
    },
    {
      placeholder: "{{score_table}}",
      description: "An auto-generated table of scores",
      data_source: "system",
    },
  ];

  // Special conditional placeholders for specific tests
  let conditionalPlaceholders: PlaceholdersType[] = [];
  if (testType === "CVLT-3") {
    conditionalPlaceholders = [
      {
        placeholder: "{{semantic_clustering_interpretation}}",
        description:
          "Conditional narrative based on Trials 1-4 Correct performance",
        data_source: "conditional",
      },
    ];
  }

  return [...commonPlaceholders, ...conditionalPlaceholders];
};

export const getAvailablePlaceholders = async (
  testType: string,
  savedPlaceholders?: PlaceholdersType[],
  User?: AppUser,
  TestSubtestDefinition?: TestDefinitionType[]
) => {
  console.log("Getting available placeholders for test type:", testType);

  const standardPlaceholders = getStandardPlaceholders(testType);
  let testBankPlaceholders: PlaceholdersType[] = [];

  try {
    // Find matching TestSubtestDefinition with more comprehensive matching
    const normalizeTestName = (name: string) =>
      (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedTestType = normalizeTestName(testType);

    console.log(
      "Searching for test definitions matching:",
      testType,
      "normalized:",
      normalizedTestType
    );

    // Get all user's test definitions first
    const allDefinitions =
      TestSubtestDefinition?.filter((def) => def.created_by === User?.email) ||
      [];
    console.log(
      "Found user test definitions:",
      allDefinitions.map((d) => d.test_name)
    );

    // Try exact match first
    let matchedDefinition = allDefinitions.find((def) => {
      const normalizedDefName = normalizeTestName(def.test_name);
      console.log(
        "Checking exact match:",
        def.test_name,
        "normalized:",
        normalizedDefName,
        "vs",
        normalizedTestType
      );
      return normalizedDefName === normalizedTestType;
    });

    // If no exact match, try aliases
    if (!matchedDefinition) {
      console.log("No exact match found, trying aliases");
      matchedDefinition = allDefinitions.find((def) => {
        if (def.test_aliases && def.test_aliases.length > 0) {
          const aliasMatch = def.test_aliases.some((alias) => {
            const normalizedAlias = normalizeTestName(alias);
            console.log(
              "Checking alias:",
              alias,
              "normalized:",
              normalizedAlias,
              "vs",
              normalizedTestType
            );
            return (
              normalizedAlias === normalizedTestType ||
              normalizedTestType.includes(normalizedAlias) ||
              normalizedAlias.includes(normalizedTestType)
            );
          });
          if (aliasMatch) {
            console.log("Found alias match for definition:", def.test_name);
            return true;
          }
        }
        return false;
      });
    }

    // If still no match, try fuzzy matching
    if (!matchedDefinition) {
      console.log("No alias match found, trying fuzzy matching");
      matchedDefinition = allDefinitions.find((def) => {
        const defName = normalizeTestName(def.test_name);
        const fuzzyMatch =
          defName.includes(normalizedTestType) ||
          normalizedTestType.includes(defName) ||
          (defName.length > 3 &&
            normalizedTestType.length > 3 &&
            defName.substring(0, 4) === normalizedTestType.substring(0, 4));
        if (fuzzyMatch) {
          console.log("Found fuzzy match for definition:", def.test_name);
        }
        return fuzzyMatch;
      });
    }

    console.log(
      "Final matched definition:",
      matchedDefinition?.test_name || "NONE"
    );

    if (matchedDefinition) {
      console.log(
        "Definition subtests:",
        matchedDefinition.subtests?.length || 0
      );

      if (matchedDefinition.subtests && matchedDefinition.subtests.length > 0) {
        console.log("Processing subtests for placeholders...");

        testBankPlaceholders = matchedDefinition.subtests.reduce<
          PlaceholdersType[]
        >((acc, subtest, index) => {
          const canonicalName = subtest.canonical_name;
          const displayName = subtest.display_name;

          if (canonicalName && canonicalName.trim()) {
            const newPlaceholders: PlaceholdersType[] = [
              {
                placeholder: `{{${canonicalName}_score}}`,
                description: `${displayName || canonicalName} Score`,
                data_source: "scores",
                testBank: true,
              },
              {
                placeholder: `{{${canonicalName}_percentile}}`,
                description: `${displayName || canonicalName} Percentile`,
                data_source: "scores",
                testBank: true,
              },
              {
                placeholder: `{{${canonicalName}_descriptor}}`,
                description: `${displayName || canonicalName} Descriptor`,
                data_source: "scores",
                testBank: true,
              },
            ];

            console.log(
              `Generated ${newPlaceholders.length} placeholders for ${canonicalName}`
            );
            return [...acc, ...newPlaceholders];
          } else {
            console.log(
              `Skipping subtest ${index + 1} - no canonical_name:`,
              subtest
            );
            return acc;
          }
        }, []);

        console.log(
          "Total Test Bank placeholders generated:",
          testBankPlaceholders.length
        );
        console.log(
          "Generated placeholders:",
          testBankPlaceholders.map((p) => p.placeholder)
        );
      } else {
        console.log("No subtests found in matched definition");
      }
    } else {
      console.log("No matching test definitions found for", testType);
    }
  } catch (error) {
    console.error("Error fetching Test Bank placeholders:", error);
  }

  // Return standard + Test Bank + saved placeholders with deduplication
  const mergedPlaceholders = Array.from(
    new Map(
      [
        ...standardPlaceholders,
        ...testBankPlaceholders,
        ...(savedPlaceholders || []),
      ].map((item) => [item.placeholder, item])
    ).values()
  );

  return mergedPlaceholders;
};
