import type { GBVolume } from "./types";
import type { BookSearchItem } from "@/types";

export function transformGBResult(volume: GBVolume): BookSearchItem {
  const info = volume.volumeInfo;
  const isbn = info.industryIdentifiers?.find(
    (i) => i.type === "ISBN_13" || i.type === "ISBN_10"
  )?.identifier ?? null;

  const thumbnail = info.imageLinks?.thumbnail
    ?.replace("http://", "https://")
    .replace("&zoom=1", "&zoom=2") ?? null;

  const year = info.publishedDate
    ? parseInt(info.publishedDate.slice(0, 4), 10) || null
    : null;

  return {
    olWorkId: `gb:${volume.id}`,
    title: info.title,
    author: info.authors?.join(", ") ?? "Autor desconocido",
    year,
    coverUrl: thumbnail,
    isbn,
    pages: info.pageCount ?? null,
    genres: info.categories?.slice(0, 5) ?? [],
    source: "google",
    synopsis: info.description ?? null,
  };
}
