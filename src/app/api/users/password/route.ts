import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return Response.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return Response.json({ error: "Contraseña actual incorrecta" }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.userId));

  return Response.json({ ok: true });
}
