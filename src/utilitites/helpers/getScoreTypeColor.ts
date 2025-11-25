import type { ScoreType } from "../types/TestSubtestDefinitions";

export const getScoreTypeColor = (type: ScoreType) => {
  const colors = {
    standard: "bg-blue-100 text-blue-800",
    scaled: "bg-green-100 text-green-800",
    // composite and percentile types are no longer explicitly managed for custom descriptors in this structure
    // composite: "bg-purple-100 text-purple-800",
    // percentile: "bg-orange-100 text-orange-800"
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};
