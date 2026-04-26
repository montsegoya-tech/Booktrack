import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { SessionData } from "@/types";

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "booktrack-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
  },
};

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username?.trim() || !password || password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username.trim().toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Ese nombre de usuario ya existe" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({
    username: username.trim().toLowerCase(),
    passwordHash,
  }).returning();

  const response = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;
  await session.save();

  return response;
}
