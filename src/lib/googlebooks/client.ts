import type { GBSearchResponse, GBVolume } from "./types";

const BASE = "https://www.googleapis.com/books/v1";

function withKey(url: string) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  return key ? `${url}&key=${key}` : url;
}

export async function searchGoogleBooks(query: string): Promise<GBSearchResponse> {
  const url = withKey(`${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=20&printType=books`);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Google Books search failed: ${res.status}`);
  return res.json();
}

export async function getGoogleBooksVolume(id: string): Promise<GBVolume> {
  const url = withKey(`${BASE}/volumes/${id}?`);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Google Books volume fetch failed: ${res.status}`);
  return res.json();
}
