import { NextRequest } from "next/server";
import { searchBooks } from "@/lib/openlibrary/client";
import { transformSearchResult } from "@/lib/openlibrary/helpers";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return Response.json({ results: [] });

  try {
    const data = await searchBooks(q);
    const results = data.docs.map(transformSearchResult);
    return Response.json({ results });
  } catch {
    return Response.json({ error: "Error al buscar libros" }, { status: 500 });
  }
}
