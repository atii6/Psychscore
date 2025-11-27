export const normalizeForMatching = (name: string) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\b(v|5)\b/g, "5")
    .replace(/\b(iv|4)\b/g, "4")
    .replace(/[^a-z0-9]/g, "");
};

export const getDescriptorFromPercentile = (percentileRank: string) => {
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

export const getDescriptorAndPercentile = (score: number) => {
  if (score >= 130)
    return {
      descriptor: "Extremely High",
      percentile_range: "98-99",
      percentile: 99,
    };
  if (score >= 120)
    return {
      descriptor: "Very High",
      percentile_range: "91-97",
      percentile: 95,
    };
  if (score >= 110)
    return {
      descriptor: "Above Average",
      percentile_range: "75-90",
      percentile: 84,
    };
  if (score >= 90)
    return { descriptor: "Average", percentile_range: "25-74", percentile: 50 };
  if (score >= 80)
    return {
      descriptor: "Below Average",
      percentile_range: "9-24",
      percentile: 16,
    };
  if (score >= 70)
    return { descriptor: "Very Low", percentile_range: "3-8", percentile: 5 };
  if (score < 70)
    return {
      descriptor: "Extremely Low",
      percentile_range: "1-2",
      percentile: 1,
    };
  return { descriptor: "", percentile_range: "", percentile: "" };
};

export const getScaledScoreDescriptor = (scaledScore: number) => {
  if (scaledScore >= 17)
    return {
      descriptor: "Extremely High",
      percentile: 99,
      percentile_range: "98-99",
    };
  if (scaledScore >= 15)
    return {
      descriptor: "Very High",
      percentile: 95,
      percentile_range: "91-97",
    };
  if (scaledScore >= 12)
    return {
      descriptor: "Above Average",
      percentile: 75,
      percentile_range: "75-90",
    };
  if (scaledScore >= 8)
    return { descriptor: "Average", percentile: 50, percentile_range: "25-74" };
  if (scaledScore >= 6)
    return {
      descriptor: "Below Average",
      percentile: 16,
      percentile_range: "9-24",
    };
  if (scaledScore >= 4)
    return { descriptor: "Very Low", percentile: 5, percentile_range: "3-8" };
  if (scaledScore <= 3)
    return {
      descriptor: "Extremely Low",
      percentile: 1,
      percentile_range: "1-2",
    };
  return { descriptor: "", percentile: "", percentile_range: "" };
};

export const getDescriptorColor = (descriptor: string) => {
  switch (descriptor) {
    case "Extremely High":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Very High":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "High Average":
      return "bg-green-100 text-green-800 border-green-200";
    case "Average":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Low Average":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Very Low":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Extremely Low":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};
