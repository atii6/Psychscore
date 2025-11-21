import { ASSESSMENT_STATUS, GENDER } from "../constants";

export type AssessmentStatusType =
  (typeof ASSESSMENT_STATUS)[keyof typeof ASSESSMENT_STATUS];

export type GenderType = (typeof GENDER)[keyof typeof GENDER];

export type ExtractedScore = {
  test_name: string;
  subtest_name: string;
  descriptor?: string;
  score_type?: string;
  display_name?: string;
  scaled_score?: number;
  canonical_name?: string;
  composite_score?: number;
  percentile_rank?: number;
  confidence_interval?: number;
};

export type AssessmentType = {
  id: number;

  client_first_name: string;
  client_last_name: string;

  gender?: GenderType;

  date_of_birth?: string;
  subjective_pronoun?: string;
  objective_pronoun?: string;
  possessive_pronoun?: string;
  test_date?: string;

  file_urls: string[];

  extracted_scores?: ExtractedScore[];

  status: AssessmentStatusType;

  notes?: string;

  rater1_first_name?: string;
  rater1_last_name?: string;
  rater1_suffix?: string;
  rater2_first_name?: string;
  rater2_last_name?: string;
  rater2_suffix?: string;

  created_by_id?: string;
  created_by?: string;
  is_sample: boolean;

  external_id?: string;
  user_id?: string;
  client_email?: string;

  is_active: boolean;

  created_date?: string;
  updated_date?: string;
};
