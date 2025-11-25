import type { ScoreType } from "./TestSubtestDefinitions";

export type UserScoreDescriptorType = {
  id: number;
  score_type: ScoreType;
  min_score: number;
  max_score: number;
  descriptor: string;
  percentile_range?: string;
  clinical_interpretation?: string;
  created_by_id?: string;
  created_by?: string;
  is_sample?: boolean;
  created_date?: Date;
  updated_date?: Date;
};
