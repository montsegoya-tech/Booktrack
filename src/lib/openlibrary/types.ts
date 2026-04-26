export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
  subject?: string[];
}

export interface OLSearchResponse {
  docs: OLSearchResult[];
  numFound: number;
}

export interface OLWorkDescription {
  value?: string;
  type?: string;
}

export interface OLWorkResponse {
  key: string;
  title: string;
  description?: string | OLWorkDescription;
  subjects?: string[];
  first_publish_date?: string;
}

export interface OLAuthorResponse {
  key: string;
  name: string;
}
