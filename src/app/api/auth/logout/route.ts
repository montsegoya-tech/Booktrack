import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
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
  const response = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(request, response, sessionOptions);
  session.destroy();
  return response;
}
