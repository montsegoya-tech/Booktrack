import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { getWorkDetails } from "@/lib/openlibrary/client";
import { extractDescription } from "@/lib/openlibrary/helpers";
import { searchGoogleBooks, getGoogleBooksVolume } from "@/lib/googlebooks/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const [book] = await db.select().from(books).where(and(eq(books.id, id), eq(books.userId, session.userId))).limit(1);
    if (!book) return Response.json({ error: "Libro no encontrado" }, { status: 404 });

    const updates: { synopsis?: string; genres?: string[] } = {};

    // 1. Try Open Library (only if olWorkId is a real OL ID)
    if (book.olWorkId && !book.olWorkId.startsWith("gb:") && !book.olWorkId.startsWith("manual:")) {
      try {
        const work = await getWorkDetails(book.olWorkId);
        if (!book.synopsis) {
          const synopsis = extractDescription(work.description);
          if (synopsis) updates.synopsis = synopsis;
        }
        if (!book.genres?.length && work.subjects?.length) {
          updates.genres = work.subjects.slice(0, 8);
        }
      } catch {
        // Open Library failed, continue to Google Books
      }
    }

    // 2. Fall back to Google Books if still missing data
    const stillMissingSynopsis = !book.synopsis && !updates.synopsis;
    const stillMissingGenres = !book.genres?.length && !updates.genres;

    if (stillMissingSynopsis || stillMissingGenres) {
      try {
        const queries = book.isbn
          ? [
              `isbn:${book.isbn}`,
              `intitle:${book.title} inauthor:${book.author}`,
              `${book.title} ${book.author}`,
            ]
          : [
              `intitle:${book.title} inauthor:${book.author}`,
              `${book.title} ${book.author}`,
            ];

        outer: for (const query of queries) {
          const gbRes = await searchGoogleBooks(query);
          for (const volume of gbRes.items ?? []) {
            const info = volume.volumeInfo;

            // If the search result has no description, fetch full volume details
            let description = info.description;
            let categories = info.categories;
            if ((stillMissingSynopsis && !updates.synopsis && !description) ||
                (stillMissingGenres && !updates.genres && !categories?.length)) {
              try {
                const detail = await getGoogleBooksVolume(volume.id);
                description = detail.volumeInfo.description ?? description;
                categories = detail.volumeInfo.categories ?? categories;
              } catch {
                // detail fetch failed, use what we have
              }
            }

            if (stillMissingSynopsis && !updates.synopsis && description) {
              updates.synopsis = description;
            }
            if (stillMissingGenres && !updates.genres && categories?.length) {
              updates.genres = categories.slice(0, 8);
            }
            if (
              (!stillMissingSynopsis || updates.synopsis) &&
              (!stillMissingGenres || updates.genres)
            ) break outer;
          }
        }
      } catch {
        // Google Books also failed
      }
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ updated: false, message: "No hay datos disponibles en ninguna fuente" });
    }

    const [updated] = await db
      .update(books)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(books.id, id), eq(books.userId, session.userId)))
      .returning();

    return Response.json({ updated: true, book: updated });
  } catch (err) {
    console.error("[refetch] unhandled error:", err);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
