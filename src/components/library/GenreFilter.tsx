"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { translateGenre } from "@/lib/genres";

export default function GenreFilter({ genres }: { genres: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const active = searchParams.get("genre") ?? "";

  function select(genre: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (active === genre) p.delete("genre");
    else p.set("genre", genre);
    p.delete("page");
    router.push(`/library?${p.toString()}`);
  }

  if (genres.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {genres.map((g) => (
        <button
          key={g}
          onClick={() => select(g)}
          className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
            active === g
              ? "bg-[#1F2937] text-white border-[#1F2937]"
              : "bg-white text-[#1F2937] border-border hover:border-[#1F2937]"
          }`}
        >
          {translateGenre(g)}
        </button>
      ))}
    </div>
  );
}
