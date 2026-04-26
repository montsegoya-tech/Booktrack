import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const all = await db.select({ id: users.id, username: users.username, createdAt: users.createdAt }).from(users);
  return Response.json(all);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { username, password } = await request.json();
  if (!username?.trim() || !password || password.length < 6) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
  if (existing.length > 0) {
    return Response.json({ error: "Este nombre de usuario ya existe" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [created] = await db.insert(users).values({
    username: username.trim().toLowerCase(),
    passwordHash,
  }).returning({ id: users.id, username: users.username });

  return Response.json(created, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { userId } = await request.json();
  if (userId === session.userId) {
    return Response.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, userId));
  return new Response(null, { status: 204 });
}
