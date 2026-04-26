import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { BookSelect } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
const LANGUAGE_LABEL: Record<string, string> = { es: "Castellano", ca: "Catalán", en: "Inglés" };

const STATUS_COLOR: Record<string, string> = {
  to_read: "bg-info",
  reading: "bg-warning",
  read: "bg-success",
};

export default function BookCard({ book }: { book: BookSelect }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-surface border border-border">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {/* Status dot */}
        <span
          className={cn(
            "absolute top-2 right-2 w-2.5 h-2.5 rounded-full",
            STATUS_COLOR[book.status] ?? "bg-muted"
          )}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 gap-1">
          <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{book.title}</p>
          <p className="text-white/70 text-xs line-clamp-1">{book.author}</p>
          {book.language && (
            <span className="text-white/80 text-[10px]">{LANGUAGE_LABEL[book.language] ?? book.language}</span>
          )}
        </div>
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm font-medium line-clamp-1">{book.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
      </div>
    </Link>
  );
}
