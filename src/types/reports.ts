export interface Report {
  id: string;
  title: string;
  summary: string;
  date: string;
  price: number;
  currency: string;
  category: string;
  language: string;
  region: string;
}

export interface ReportsResponse {
  reports: Report[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface Filters {
  search: string;
  category_id: string;
  language_id: string;
  region: string;
  year: string;
  page: number;
  per_page: number;
}
