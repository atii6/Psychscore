export interface GeneratedReport {
  assessment_id: number;
  template_id?: string | null;
  report_content: string;
  report_title?: string | null;
  client_name?: string | null;

  created_date?: string;
  updated_date?: string;
}
