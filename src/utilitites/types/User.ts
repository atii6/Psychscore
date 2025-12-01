export type UserRole = "admin" | "user";

export type ReportTableThemeColor =
  | "neutral_gray"
  | "soft_orange"
  | "mint_green"
  | "light_blue";

export type ReportFontFamily =
  | "Times New Roman"
  | "Arial"
  | "Calibri"
  | "Georgia"
  | "Verdana";

export type AppUserAttributes = {
  id: number;

  role: UserRole;
  email: string;
  full_name: string;
  phone?: string;
  password?: string;

  license_number?: string;
  practice_name?: string;

  report_table_theme_color?: ReportTableThemeColor;
  report_table_show_title?: boolean;

  report_header_content?: string;
  report_footer_content?: string;

  report_font_family?: ReportFontFamily;
  use_ai_descriptors?: boolean;

  created_date?: Date;
  updated_date?: Date;
};
