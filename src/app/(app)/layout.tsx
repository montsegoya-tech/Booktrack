import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Suspense>
          <Sidebar username={session.username} />
        </Suspense>
        <main className="flex-1 overflow-y-auto main-volumetric pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </>
  );
}
