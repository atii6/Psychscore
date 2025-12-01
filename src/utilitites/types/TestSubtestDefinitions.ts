export type ScoreType = "standard" | "scaled";
export interface SubtestType {
  canonical_name: string;
  display_name: string;
  aliases: string[];
  score_type: ScoreType;
  is_user_defined: boolean;
}

export type TestDefinitionType = {
  id: number;
  test_name: string;
  test_aliases: string[];
  subtests: SubtestType[];
  subtest_placeholders: string[];
  is_system_template?: boolean;
  created_by_id?: number;
  created_by?: string;
};
