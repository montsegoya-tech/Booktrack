"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  bookId: string;
  onUpdate: (rating: number | null) => Promise<void>;
}

export default function StarRating({ value, bookId: _bookId, onUpdate }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  function handleClick(n: number) {
    // clicking the same star that's already selected removes the rating
    onUpdate(value === n ? null : n);
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => handleClick(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              n <= display
                ? "fill-[#079bab] text-[#079bab]"
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
