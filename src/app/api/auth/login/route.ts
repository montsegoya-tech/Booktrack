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

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.trim().toLowerCase()))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.isLoggedIn = true;
  session.userId = user.id;
  session.username = user.username;
  await session.save();

  return response;
}
