import type { OLSearchResponse, OLWorkResponse } from "./types";

const BASE = "https://openlibrary.org";

export async function searchBooks(query: string): Promise<OLSearchResponse> {
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median,subject`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Open Library search failed");
  return res.json();
}

export async function getWorkDetails(workId: string): Promise<OLWorkResponse> {
  const id = workId.startsWith("/works/") ? workId : `/works/${workId}`;
  const url = `${BASE}${id}.json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Open Library work fetch failed");
  return res.json();
}
