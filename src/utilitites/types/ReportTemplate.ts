export type TemplateCategory =
  | "cognitive"
  | "personality"
  | "behavioral"
  | "achievement"
  | "neuropsychological"
  | "self-report";

export type DataSourceType =
  | "client_info"
  | "test_info"
  | "system"
  | "scores"
  | "custom"
  | "conditional";

export type PlaceholdersType = {
  data_source: DataSourceType;
  description: string;
  placeholder: string;
  testBank?: boolean;
  custom?: boolean;
};

export type ReportTemplateType = {
  id: number;
  template_name: string;
  test_type: string;
  template_content: string;
  is_active: boolean;
  is_system_template: boolean;
  category?: TemplateCategory;
  available_placeholders?: PlaceholdersType[];
  created_by_id?: number;
  created_by?: string;
  is_sample: boolean;
  is_active_template: boolean;
  created_date?: string;
  updated_date?: string;
};
