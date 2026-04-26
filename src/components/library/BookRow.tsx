import Link from "next/link";
import Image from "next/image";
import { BookOpen, Star } from "lucide-react";
import type { BookSelect } from "@/lib/db/schema";
import FormatBadge from "@/components/book/FormatBadge";
import type { BookFormat } from "@/types";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  to_read: { label: "Por leer", className: "text-info" },
  reading: { label: "Leyendo", className: "text-warning" },
  read: { label: "Leído", className: "text-success" },
};

export default function BookRow({ book }: { book: BookSelect }) {
  const statusInfo = STATUS_LABEL[book.status];

  return (
    <Link
      href={`/book/${book.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface hover:bg-surface-raised transition-colors"
    >
      <div className="relative w-12 h-18 shrink-0">
        <div className="w-12 h-[72px] rounded overflow-hidden bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              width={48}
              height={72}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium line-clamp-1">{book.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
        <div className="flex items-center gap-2">
          <FormatBadge format={book.format as BookFormat} />
          {book.year && <span className="text-xs text-muted-foreground">{book.year}</span>}
        </div>
      </div>

      <div className="text-right shrink-0 space-y-1">
        <p className={`text-sm font-medium ${statusInfo?.className}`}>{statusInfo?.label}</p>
        {book.rating && (
          <div className="flex items-center gap-0.5 justify-end">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{book.rating}/5</span>
          </div>
        )}
      </div>
    </Link>
  );
}
