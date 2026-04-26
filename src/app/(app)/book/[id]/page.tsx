import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import BookCover from "@/components/book/BookCover";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import BookStatusBar from "@/components/book/BookStatusBar";
import DeleteBookButton from "@/components/book/DeleteBookButton";
import EditableBookTitle from "@/components/book/EditableBookTitle";
import { formatYear, formatPages } from "@/lib/utils";
import { translateGenre } from "@/lib/genres";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);

  if (!book) notFound();

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-5 flex items-center gap-3 bg-white sticky top-0 z-10">
        <Link
          href="/library"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading text-lg font-semibold line-clamp-1">{book.title}</h1>
        <DeleteBookButton bookId={book.id} className="ml-auto" />
      </div>

      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Top row: cover + title/meta */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <BookCover bookId={book.id} coverUrl={book.coverUrl} title={book.title} />
            <div className="space-y-2 pt-1">
              <EditableBookTitle bookId={book.id} title={book.title} />
              <p className="text-xl text-[#0f172a]">{book.author}</p>
              <div className="flex flex-col gap-0.5 pt-1">
                {book.year && <span className="text-sm text-[#0f172a]">Año: {formatYear(book.year)}</span>}
                {book.pages && <span className="text-sm text-[#0f172a]">{formatPages(book.pages)}</span>}
                {book.isbn && <span className="text-sm text-[#0f172a]">ISBN: {book.isbn}</span>}
              </div>
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {book.genres.slice(0, 6).map((g) => (
                    <Badge key={g} variant="outline" className="text-xs bg-[#e8b4b4] border-[#d9a0a0] text-[#0f172a]">
                      {translateGenre(g)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <BookStatusBar book={book} />
        </div>
      </div>
    </div>
  );
}
