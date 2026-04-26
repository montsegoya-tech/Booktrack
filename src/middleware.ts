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

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.isLoggedIn || !session.userId) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!login|register|forgot-password|api/auth|api/keepalive|_next/static|_next/image|favicon.ico|icon.svg|share).*)",
  ],
};
