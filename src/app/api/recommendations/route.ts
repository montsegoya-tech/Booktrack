import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import { translateGenre } from "@/lib/genres";
import { cookies } from "next/headers";

const client = new Anthropic();
const COOKIE = "rec_date";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const jar = await cookies();
  const today = new Date().toISOString().slice(0, 10);
  if (jar.get(COOKIE)?.value === today) {
    return Response.json({ error: "Ya has pedido recomendaciones hoy. Vuelve mañana." }, { status: 429 });
  }

  const readBooks = await db
    .select({
      title: books.title,
      author: books.author,
      rating: books.rating,
      genres: books.genres,
      year: books.year,
    })
    .from(books)
    .where(and(eq(books.userId, session.userId), eq(books.status, "read")))
    .limit(50);

  if (readBooks.length === 0) {
    return Response.json({ error: "No tienes libros leídos aún" }, { status: 400 });
  }

  const bookList = readBooks
    .map((b) => {
      const genres = (b.genres ?? []).map(translateGenre).join(", ");
      const rating = b.rating ? `${b.rating}/5` : "sin valorar";
      return `- "${b.title}" de ${b.author}${b.year ? ` (${b.year})` : ""}${genres ? ` [${genres}]` : ""} — ${rating}`;
    })
    .join("\n");

  const prompt = `Soy una lectora española apasionada. Estos son los libros que he leído:\n\n${bookList}\n\nBasándote en mis gustos, recomiéndame exactamente 6 libros que todavía no haya leído. Para cada recomendación, incluye:\n- Título y autor\n- Año de publicación\n- Por qué me podría gustar (1-2 frases, conectando con mis lecturas)\n\nResponde en español. Sé específica y personal, no genérica. Prioriza los libros con mejor valoración en mis preferencias.`;

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1500,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
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
      "Set-Cookie": `${COOKIE}=${today}; Path=/; HttpOnly; SameSite=Lax; Expires=${midnight.toUTCString()}`,
    },
  });
}
