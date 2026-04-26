import { NextRequest } from "next/server";
import { getWorkDetails } from "@/lib/openlibrary/client";
import { extractDescription } from "@/lib/openlibrary/helpers";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return Response.json({ error: "id requerido" }, { status: 400 });

  try {
    const work = await getWorkDetails(id);
    return Response.json({
      synopsis: extractDescription(work.description),
      subjects: work.subjects?.slice(0, 8) ?? [],
    });
  } catch {
    return Response.json({ error: "Error al obtener detalles" }, { status: 500 });
  }
}
