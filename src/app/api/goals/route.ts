import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { readingGoals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const year = parseInt(
    new URL(request.url).searchParams.get("year") ?? String(new Date().getFullYear()),
    10
  );

  const [goal] = await db
    .select()
    .from(readingGoals)
    .where(and(eq(readingGoals.userId, session.userId), eq(readingGoals.year, year)));

  return Response.json(goal ?? null);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { year, goal } = await request.json() as { year: number; goal: number };
  if (!year || year < 2000 || year > 2100 || !goal || goal < 1 || goal > 9999) {
    return Response.json({ error: "Inválido" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(readingGoals)
    .where(and(eq(readingGoals.userId, session.userId), eq(readingGoals.year, year)));

  let result;
  if (existing) {
    [result] = await db
      .update(readingGoals)
      .set({ goal })
      .where(and(eq(readingGoals.userId, session.userId), eq(readingGoals.year, year)))
      .returning();
  } else {
    [result] = await db
      .insert(readingGoals)
      .values({ userId: session.userId, year, goal })
      .returning();
  }

  return Response.json(result);
}
