import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
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

    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      console.warn("[refetch] GOOGLE_BOOKS_API_KEY not set");
      return Response.json({ updated: false, message: "Configura GOOGLE_BOOKS_API_KEY en Vercel" });
    }

    const updates: { synopsis?: string; genres?: string[] } = {};

    const queries = book.isbn
      ? [`isbn:${book.isbn}`, `intitle:${book.title} inauthor:${book.author}`]
      : [`intitle:${book.title} inauthor:${book.author}`, `${book.title} ${book.author}`];

    outer: for (const query of queries) {
      let gbRes;
      try {
        gbRes = await searchGoogleBooks(query);
      } catch (err) {
        console.error("[refetch] search error:", err);
        continue;
      }

      for (const volume of gbRes.items ?? []) {
        let { description, categories } = volume.volumeInfo;

        if (!description || !categories?.length) {
          try {
            const detail = await getGoogleBooksVolume(volume.id);
            description = detail.volumeInfo.description ?? description;
            categories = detail.volumeInfo.categories ?? categories;
          } catch {
            // use what we have
          }
        }

        if (description && !updates.synopsis) updates.synopsis = description;
        if (categories?.length && !updates.genres) updates.genres = categories.slice(0, 8);

        if (updates.synopsis && updates.genres) break outer;
      }
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ updated: false, message: "Google Books no tiene datos para este libro" });
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
