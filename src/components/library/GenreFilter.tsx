"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { translateGenre } from "@/lib/genres";

export default function GenreFilter({ genres }: { genres: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeGenres = searchParams.getAll("genre");

  function toggle(genre: string) {
    const p = new URLSearchParams(searchParams.toString());
    const current = p.getAll("genre");
    p.delete("genre");
    if (current.includes(genre)) {
      current.filter((g) => g !== genre).forEach((g) => p.append("genre", g));
    } else {
      [...current, genre].forEach((g) => p.append("genre", g));
    }
    p.delete("page");
    router.push(`/library?${p.toString()}`);
  }

  if (genres.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {genres.map((g) => {
        const isActive = activeGenres.includes(g);
        return (
          <button
            key={g}
            onClick={() => toggle(g)}
            className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
              isActive
                ? "bg-[#1F2937] text-white border-[#1F2937]"
                : "bg-white text-[#1F2937] border-border hover:border-[#1F2937]"
            }`}
          >
            {translateGenre(g)}
          </button>
        );
      })}
    </div>
  );
}
