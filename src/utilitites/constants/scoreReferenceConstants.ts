export const COLOR_CLASSES = {
  red: "bg-red-100 text-red-800 border-red-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};

export const SCALED_SCORE_REFERENCE = {
  title: "Scaled Score Reference",
  subtitle: "Subtest Score Interpretations (Mean = 10, SD = 3)",
  ranges: [
    {
      scaledScore: "17-19",
      descriptor: "Extremely High",
      color: "purple",
      percentile: "98-99",
    },
    {
      scaledScore: "15-16",
      descriptor: "Very High",
      color: "indigo",
      percentile: "91-97",
    },
    {
      scaledScore: "12-14",
      descriptor: "Above Average",
      color: "green",
      percentile: "75-90",
    },
    {
      scaledScore: "8-11",
      descriptor: "Average",
      color: "blue",
      percentile: "25-74",
    },
    {
      scaledScore: "6-7",
      descriptor: "Below Average",
      color: "yellow",
      percentile: "9-24",
    },
    {
      scaledScore: "4-5",
      descriptor: "Very Low",
      color: "orange",
      percentile: "3-8",
    },
    {
      scaledScore: "1-3",
      descriptor: "Extremely Low",
      color: "red",
      percentile: "1-2",
    },
  ],
};

// Clinical scoring reference data
export const CLINICAL_SCORE_REFERENCE = {
  title: "Standard Score Interpretations",
  subtitle: "Official Clinical Descriptors for Psychological Assessments",
  ranges: [
    {
      standardScore: "130+",
      percentile: "98-99",
      descriptor: "Extremely High",
      color: "purple",
      description: "Performance well above the normal range",
    },
    {
      standardScore: "120-129",
      percentile: "91-97",
      descriptor: "Very High",
      color: "indigo",
      description: "Performance significantly above average",
    },
    {
      standardScore: "110-119",
      percentile: "75-90",
      descriptor: "Above Average",
      color: "green",
      description: "Performance above average range",
    },
    {
      standardScore: "90-109",
      percentile: "25-74",
      descriptor: "Average",
      color: "blue",
      description: "Performance within normal limits",
    },
    {
      standardScore: "80-89",
      percentile: "9-24",
      descriptor: "Below Average",
      color: "yellow",
      description: "Performance below average but within normal variation",
    },
    {
      standardScore: "70-79",
      percentile: "3-8",
      descriptor: "Very Low",
      color: "orange",
      description: "Performance significantly below average",
    },
    {
      standardScore: "69 & below",
      percentile: "1-2",
      descriptor: "Extremely Low",
      color: "red",
      description: "Performance well below the normal range",
    },
  ],
};
