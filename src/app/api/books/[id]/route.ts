import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import type { ReadStatus, BookFormat } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const [book] = await db.select().from(books).where(and(eq(books.id, id), eq(books.userId, session.userId))).limit(1);
  if (!book) return Response.json({ error: "Libro no encontrado" }, { status: 404 });
  return Response.json(book);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as {
    status?: ReadStatus;
    format?: BookFormat;
    rating?: number | null;
    notes?: string;
    title?: string;
    synopsis?: string | null;
    coverUrl?: string | null;
    language?: "es" | "ca" | "en";
    readAt?: string | null;
    genres?: string[];
  };

  const { readAt: readAtRaw, ...rest } = body;
  const extraFields: { readAt?: Date | null } = {};
  if (readAtRaw !== undefined) {
    extraFields.readAt = readAtRaw ? new Date(readAtRaw) : null;
  }

  const [updated] = await db
    .update(books)
    .set({ ...rest, ...extraFields, updatedAt: new Date() })
    .where(and(eq(books.id, id), eq(books.userId, session.userId)))
    .returning();

  if (!updated) return Response.json({ error: "Libro no encontrado" }, { status: 404 });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await db.delete(books).where(and(eq(books.id, id), eq(books.userId, session.userId)));
  return new Response(null, { status: 204 });
}
