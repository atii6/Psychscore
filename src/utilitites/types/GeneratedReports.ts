export interface GeneratedReport {
  id: number;
  assessment_id: number;
  template_id?: number | null;
  report_content: string;
  report_title?: string | null;
  client_name?: string | null;

  created_date?: string;
  updated_date?: string;
}
