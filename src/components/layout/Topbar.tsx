"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Topbar({ bookCount, username }: { bookCount: number; username?: string }) {
  const router = useRouter();

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = (e.target as HTMLInputElement).value.trim();
      if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  const initial = username?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="border-b border-border flex items-center px-4 md:px-6 py-4 md:py-5 gap-4 bg-white sticky top-0 z-10">
      <div className="relative flex-1 max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en Open Library..."
          className="pl-9 bg-white border-border h-8 rounded-full"
          onKeyDown={handleSearch}
        />
      </div>
      <div className="flex items-center gap-3 ml-auto text-sm text-muted-foreground shrink-0">
        {username && <span className="font-medium text-[#1C1008]">{username}</span>}
        <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
          {initial}
        </div>
      </div>
    </header>
  );
}
