export interface GBVolumeInfo {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  categories?: string[];
}

export interface GBVolume {
  id: string;
  volumeInfo: GBVolumeInfo;
}

export interface GBSearchResponse {
  items?: GBVolume[];
  totalItems: number;
}
