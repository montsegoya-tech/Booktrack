import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense>
        <Sidebar username={session.username} />
      </Suspense>
      <main className="flex-1 overflow-y-auto main-volumetric">{children}</main>
    </div>
  );
}
