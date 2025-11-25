export type ColorClassesType = {
  [key: string]: string;
};

export interface StandardScoreRangeType {
  scaledScore: string;
  descriptor: string;
  color: string;
  percentile: string;
}

export interface ClinicalScoreRangeType {
  standardScore: string;
  description: string;
  descriptor: string;
  color: string;
  percentile: string;
}

export type ClinicalScoreReferenceType = {
  title: string;
  subtitle: string;
  ranges: ClinicalScoreRangeType[];
};

export type StandardScoreReferenceType = {
  title: string;
  subtitle: string;
  ranges: StandardScoreRangeType[];
};
