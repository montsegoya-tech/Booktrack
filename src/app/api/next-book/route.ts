import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { translateGenre } from "@/lib/genres";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const client = new Anthropic();
const COOKIE = "nextbook_uses";
const MAX_USES = 2;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value ?? "";
  const [cookieDate, countStr] = raw.split(":");
  const uses = cookieDate === today ? parseInt(countStr ?? "0", 10) : 0;

  if (uses >= MAX_USES) {
    return Response.json({ error: "Ya has usado esta función 2 veces hoy. Vuelve mañana.", limitReached: true }, { status: 429 });
  }

  const { mood } = await request.json() as { mood: string };
  if (!mood?.trim()) return Response.json({ error: "Dime qué te apetece" }, { status: 400 });

  const [toReadBooks, readBooks] = await Promise.all([
    db
      .select({ title: books.title, author: books.author, genres: books.genres, year: books.year, pages: books.pages, synopsis: books.synopsis })
      .from(books)
      .where(and(eq(books.userId, session.userId), eq(books.status, "to_read"))),
    db
      .select({ title: books.title, author: books.author, rating: books.rating, genres: books.genres })
      .from(books)
      .where(and(eq(books.userId, session.userId), eq(books.status, "read")))
      .limit(30),
  ]);

  if (toReadBooks.length === 0) {
    return Response.json({ error: "No tienes libros pendientes de leer" }, { status: 400 });
  }

  const pendingList = toReadBooks
    .map((b) => {
      const genres = (b.genres ?? []).map(translateGenre).join(", ");
      const meta = [b.year && `${b.year}`, b.pages && `${b.pages} págs`, genres].filter(Boolean).join(" · ");
      const synopsis = b.synopsis ? ` — "${b.synopsis.slice(0, 120)}${b.synopsis.length > 120 ? "…" : ""}"` : "";
      return `- "${b.title}" de ${b.author}${meta ? ` (${meta})` : ""}${synopsis}`;
    })
    .join("\n");

  const readList = readBooks.length > 0
    ? readBooks
        .map((b) => {
          const genres = (b.genres ?? []).map(translateGenre).join(", ");
          return `- "${b.title}" de ${b.author}${b.rating ? ` (${b.rating}/5)` : ""}${genres ? ` [${genres}]` : ""}`;
        })
        .join("\n")
    : "Ninguno todavía.";

  const prompt = `Soy una lectora española con esta lista de libros pendientes:\n\n${pendingList}\n\nLibros que ya he leído (para entender mis gustos):\n${readList}\n\nHoy me apetece: "${mood.trim()}"\n\nElige UN SOLO libro de mi lista de pendientes que mejor encaje con lo que me apetece ahora mismo. Explica en 3-4 frases por qué ese libro es perfecto para este momento, conectando el estado de ánimo que describí con las características del libro. Sé entusiasta y personal. Termina con una frase de ánimo para empezarlo.`;

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 600,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Set-Cookie": `${COOKIE}=${today}:${uses + 1}; Path=/; HttpOnly; SameSite=Lax; Expires=${midnight.toUTCString()}`,
    },
  });
}
