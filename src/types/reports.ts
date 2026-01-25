export interface Report {
  id: number;
  title: string;
  introduction_description: string;
  cost: string;
  report_date: string;
  // Additional fields for detailed report view
  last_updated?: string;
  base_year?: string;
  format?: string;
  industry?: string;
  forecast_period?: string;
  report_id?: string;
  number_of_pages?: string;
  toc_included?: boolean;
  key_highlights?: string;
  dominant_segments?: string;
  competitive_intelligence?: string;
  strategic_insights?: string;
  regional_dynamics?: string;
  image_url?: string;
  category?: string;
  share_at?: string;
  report_reference_title?: string;
  report_identity?: ReportIdentity;
}

export interface ReportDetail {
  id: number;
  language_id: number;
  title: string;
  image: string;
  category_id: number;
  report_id: string;
  number_of_pages: string;
  format: string;
  introduction_section: string;
  introduction_description: string;
  key_report_highlights: string;
  key_report_description: string;
  dominant_section: string;
  dominant_description: string;
  strategic_section: string;
  strategic_description: string;
  competititve_section: string;
  competititve_description: string;
  regional_section: string;
  regional_description: string;
  one_time_section: string;
  cost: string;
  free_sample: string;
  free_sample_section: string;
  download_button: string;
  need_custom_report: string;
  custom_report_description: string;
  custom_report_button: string;
  created_at: string;
  modify_at: string;
  share_at?: string;
  breadcrumb?: string;
  report_identity?: ReportIdentity;
}

export interface ReportIdentity {
  actual_report_id: number;
  report_reference_id: string;
  category_id: number;
  category_reference_id: number;
  language_id: string;
}

export interface ReportDetail {
  id: number;
  language_id: number;
  title: string;
  image: string;
  category_id: number;
  report_id: string;
  number_of_pages: string;
  format: string;
  introduction_section: string;
  introduction_description: string;
  key_report_highlights: string;
  key_report_description: string;
  dominant_section: string;
  dominant_description: string;
  strategic_section: string;
  strategic_description: string;
  competititve_section: string;
  competititve_description: string;
  regional_section: string;
  regional_description: string;
  one_time_section: string;
  cost: string;
  free_sample: string;
  free_sample_section: string;
  download_button: string;
  need_custom_report: string;
  custom_report_description: string;
  custom_report_button: string;
  created_at: string;
  updated_at?: string;
  modify_at: string;
  base_year?: string;
  forecast_period?: string;
  share_at?: string;
  report_identity?: ReportIdentity;
  // Market Scope Fields
  study_period_description?: string;
  market_base_year?: string;
  estimated_year?: string;
  forcast_period?: string; // Note: 'forcast' typo in API
  historical_period?: string;
  growth_rate?: string;
  market_size_value_title_1?: string;
  market_size_value_description_1?: string;
  market_size_value_title_2?: string;
  market_size_value_description_2?: string;
  segmentation_covered?: string;
  market_leaders?: string;
  regions_and_countries_covered?: string;
  // Recent Developments
  recent_developments?: string;
  // FAQ
  [key: string]: any; // To handle question_1, answer_1, etc. and other dynamic fields
}

export interface ReportSection {
  id: number;
  report_id: number;
  language_id: number;
  section_name: string;
  section_title: string;
  section_description: string;
  [key: string]: any;
}

export interface ReportDetailResponse {
  success: boolean;
  share_at?: string;
  report_reference_title?: string;
  report_identity?: ReportIdentity;
  report_meta_fields?: any; // Define a more specific type if needed
  data: {
    report: ReportDetail;
    sections: ReportSection[];
    seo: any;
  };
  common_layout: {
    id: number;
    language_id: number;
    title: string;
    report_conclusion: string;
    card_one_title: string;
    card_two_title: string;
    card_three_title: string;
  };
}

export interface ReportsResponse {
  reports: Report[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  category_name?: string;
  category_desc?: string;
  base_year?: string;
  forecast_period?: string;
}

export interface Filters {
  search: string;
  category_id: string;
  base_year: string;
  forecast_period: string;
  page: number;
  per_page: number;
  language_id: string;
}
