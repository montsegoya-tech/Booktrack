export type ReadStatus = "to_read" | "reading" | "read";
export type BookFormat = "physical" | "ebook" | "audiobook";

export interface Book {
  id: string;
  olWorkId: string;
  title: string;
  author: string;
  synopsis: string | null;
  year: number | null;
  pages: number | null;
  coverUrl: string | null;
  isbn: string | null;
  publisher: string | null;
  genres: string[] | null;
  status: ReadStatus;
  format: BookFormat;
  rating: number | null;
  notes: string | null;
  addedAt: Date | null;
  updatedAt: Date | null;
}

export interface BookSearchItem {
  olWorkId: string;
  title: string;
  author: string;
  year: number | null;
  coverUrl: string | null;
  isbn: string | null;
  pages: number | null;
  genres: string[];
  source?: "openlibrary" | "google" | "manual";
  synopsis?: string | null;
}

export interface SessionData {
  isLoggedIn: boolean;
  userId: string;
  username: string;
}
