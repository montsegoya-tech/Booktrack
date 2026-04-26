import type { GBSearchResponse, GBVolume } from "./types";

const BASE = "https://www.googleapis.com/books/v1";

export async function searchGoogleBooks(query: string): Promise<GBSearchResponse> {
  const url = `${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Google Books search failed");
  return res.json();
}

export async function getGoogleBooksVolume(id: string): Promise<GBVolume> {
  const url = `${BASE}/volumes/${id}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Google Books volume fetch failed");
  return res.json();
}
