import { NextRequest } from "next/server";
import { searchBooks } from "@/lib/openlibrary/client";
import { transformSearchResult } from "@/lib/openlibrary/helpers";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

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
