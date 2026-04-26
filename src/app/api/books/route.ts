import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { getWorkDetails } from "@/lib/openlibrary/client";
import { extractDescription } from "@/lib/openlibrary/helpers";
import { searchBooks } from "@/lib/openlibrary/client";
import { transformSearchResult } from "@/lib/openlibrary/helpers";
import { getSession } from "@/lib/auth/session";
import type { BookFormat } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const allBooks = await db
    .select()
    .from(books)
    .where(eq(books.userId, session.userId))
    .orderBy(desc(books.addedAt));
  return Response.json(allBooks);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();

  if (body.bookData) {
    const { bookData, format = "physical" } = body as {
      bookData: {
        olWorkId: string;
        title: string;
        author: string;
        year?: number | null;
        pages?: number | null;
        coverUrl?: string | null;
        isbn?: string | null;
        genres?: string[];
        synopsis?: string | null;
      };
      format?: BookFormat;
    };

    const existing = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.userId, session.userId), eq(books.olWorkId, bookData.olWorkId)))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ error: "Este libro ya está en tu lista" }, { status: 409 });
    }

    const [created] = await db
      .insert(books)
      .values({
        userId: session.userId,
        olWorkId: bookData.olWorkId,
        title: bookData.title,
        author: bookData.author,
        synopsis: bookData.synopsis ?? null,
        year: bookData.year ?? null,
        pages: bookData.pages ?? null,
        coverUrl: bookData.coverUrl ?? null,
        isbn: bookData.isbn ?? null,
        genres: bookData.genres ?? [],
        format,
        status: "to_read",
      })
      .returning();

    return Response.json(created, { status: 201 });
  }

  const { olWorkId, format = "physical" } = body as { olWorkId: string; format?: BookFormat };

  const existing = await db
    .select({ id: books.id })
    .from(books)
    .where(and(eq(books.userId, session.userId), eq(books.olWorkId, olWorkId)))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "Este libro ya está en tu lista" }, { status: 409 });
  }

  const workKey = olWorkId.replace("/works/", "");
  const searchData = await searchBooks(workKey);
  const searchResult = searchData.docs.find((d) => d.key === olWorkId);

  let synopsis: string | null = null;
  let subjects: string[] = [];
  try {
    const work = await getWorkDetails(olWorkId);
    synopsis = extractDescription(work.description);
    subjects = work.subjects?.slice(0, 8) ?? [];
  } catch { }

  const bookData = searchResult
    ? transformSearchResult(searchResult)
    : { olWorkId, title: "Libro desconocido", author: "Desconocido", year: null, coverUrl: null, isbn: null, pages: null, genres: [] };

  const [created] = await db
    .insert(books)
    .values({
      userId: session.userId,
      olWorkId,
      title: bookData.title,
      author: bookData.author,
      synopsis,
      year: bookData.year,
      pages: bookData.pages,
      coverUrl: bookData.coverUrl,
      isbn: bookData.isbn,
      genres: subjects.length > 0 ? subjects : bookData.genres,
      format,
      status: "to_read",
    })
    .returning();

  return Response.json(created, { status: 201 });
}
