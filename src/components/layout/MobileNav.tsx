"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Search, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/library", icon: Library, label: "Biblioteca" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/settings", icon: Settings, label: "Ajustes" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden sidebar-volumetric border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs transition-colors min-w-[60px]",
              pathname === href
                ? "text-white font-semibold"
                : "text-white/50 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
