"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, Settings, LogOut, Library, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const GENRES = [
  { label: "Ficción", value: "Fiction" },
  { label: "No-ficción", value: "Nonfiction" },
  { label: "Misterio", value: "Mystery" },
  { label: "Policial", value: "Thriller" },
  { label: "Drama", value: "Drama" },
  { label: "Romance", value: "Romance" },
  { label: "Historia", value: "History" },
  { label: "Ciencia ficción", value: "Science Fiction" },
  { label: "Biografía", value: "Biography" },
  { label: "Poesía", value: "Poetry" },
];

const LANGUAGE_LINKS = [
  { label: "Castellano", value: "es" },
  { label: "Catalán", value: "ca" },
  { label: "Inglés", value: "en" },
];

const STATUS_LINKS = [
  { label: "Todos", value: "" },
  { label: "Por leer", value: "to_read" },
  { label: "Leyendo", value: "reading" },
  { label: "Leídos", value: "read" },
];

export default function Sidebar({ username }: { username?: string }) {
  const initial = username?.[0]?.toUpperCase() ?? "?";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentStatus = searchParams.get("status") ?? "";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    router.push("/login");
  }

  function buildLibraryUrl(params: Record<string, string>) {
    const p = new URLSearchParams(params);
    return `/library?${p.toString()}`;
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen border-r border-border sidebar-volumetric sticky top-0 rounded-tr-2xl">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/library" className="flex items-center gap-2 group">
          <Image src="/booktrack-icon.svg" alt="Booktrack" width={32} height={32} className="rounded-lg" />
          <span className="font-heading font-bold text-lg text-sidebar-foreground">Booktrack</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <NavItem href="/library" icon={<Library className="w-4 h-4" />} label="Biblioteca" active={pathname === "/library"} />
        <NavItem href="/search" icon={<Search className="w-4 h-4" />} label="Buscar libros" active={pathname === "/search"} />
        <NavItem href="/stats" icon={<BarChart3 className="w-4 h-4" />} label="Estadísticas" active={pathname === "/stats"} />
        <NavItem href="/settings" icon={<Settings className="w-4 h-4" />} label="Ajustes" active={pathname === "/settings"} />

        {/* Status filter */}
        <div className="pt-4">
          <p className="px-3 text-xs font-bold text-[#ce433d] uppercase tracking-wider mb-1 border-0 outline-none shadow-none no-text-shadow">Estado</p>
          {STATUS_LINKS.map((s) => (
            <Link
              key={s.value}
              href={buildLibraryUrl(s.value ? { status: s.value } : {})}
              className={cn(
                "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                currentStatus === s.value
                  ? "bg-[#ce433d] text-white font-semibold shadow-inset-relief translate-y-px"
                  : "text-white/80 hover:text-white hover:bg-[#e8a0a0]/50"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Genre filter */}
        <div className="pt-4">
          <p className="px-3 text-xs font-bold text-[#ce433d] uppercase tracking-wider mb-1 border-0 outline-none shadow-none no-text-shadow">Géneros</p>
          {GENRES.map((g) => {
            const current = searchParams.get("genre") ?? "";
            return (
              <Link
                key={g.value}
                href={buildLibraryUrl(current === g.value ? {} : { genre: g.value })}
                className={cn(
                  "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                  current === g.value
                    ? "bg-accent text-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-foreground hover:bg-accent"
                )}
              >
                {g.label}
              </Link>
            );
          })}
        </div>

        {/* Language filter */}
        <div className="pt-4">
          <p className="px-3 text-xs font-bold text-[#ce433d] uppercase tracking-wider mb-1 border-0 outline-none shadow-none no-text-shadow">Idiomas</p>
          {LANGUAGE_LINKS.map((l) => {
            const current = searchParams.get("language") ?? "";
            return (
              <Link
                key={l.value}
                href={buildLibraryUrl(current === l.value ? {} : { language: l.value })}
                className={cn(
                  "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                  current === l.value
                    ? "bg-accent text-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-foreground hover:bg-accent"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-sidebar-foreground/70 hover:text-foreground hover:bg-accent transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
            {initial}
          </div>
          <span className="flex-1 text-left truncate">{username ?? "Usuario"}</span>
          <LogOut className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors [&>svg]:text-white",
        active
          ? "bg-[#ce433d] text-white font-semibold shadow-inset-relief translate-y-px"
          : "text-white/80 hover:text-white hover:bg-[#e8a0a0]/50"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
