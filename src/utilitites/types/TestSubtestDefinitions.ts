export interface Subtests {
  canonical_name: string;
  display_name: string;
  aliases: string[];
  score_type: "standard" | "scaled";
  is_user_defined: boolean;
}

export type TestSubtestDefinition = {
  test_name: string;
  test_aliases: string[];
  subtests: Subtests[];
  subtest_placeholders: string[];
  is_system_template: boolean;
  created_by_id: string;
  created_by: string;
};
