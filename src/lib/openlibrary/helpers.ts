import type { OLSearchResult, OLWorkDescription } from "./types";
import type { BookSearchItem } from "@/types";

export function transformSearchResult(result: OLSearchResult): BookSearchItem {
  return {
    olWorkId: result.key,
    title: result.title,
    author: result.author_name?.join(", ") ?? "Autor desconocido",
    year: result.first_publish_year ?? null,
    coverUrl: result.cover_i
      ? `https://covers.openlibrary.org/b/id/${result.cover_i}-L.jpg`
      : null,
    isbn: result.isbn?.[0] ?? null,
    pages: result.number_of_pages_median ?? null,
    genres: result.subject?.slice(0, 5) ?? [],
    source: "openlibrary",
  };
}

export function extractDescription(
  description?: string | OLWorkDescription
): string | null {
  if (!description) return null;
  if (typeof description === "string") return description;
  return description.value ?? null;
}
