import { notFound } from "next/navigation";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { translateGenre } from "@/lib/genres";
import { formatYear, formatPages } from "@/lib/utils";
import AddSharedBook from "@/components/book/AddSharedBook";
import { getSession } from "@/lib/auth/session";

const LANGUAGE_LABELS: Record<string, string> = {
  es: "Castellano", ca: "Catalán", en: "Inglés",
  fr: "Francés", de: "Alemán", it: "Italiano", pt: "Portugués",
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  if (!book) notFound();

  const session = await getSession();
  let alreadyOwned = false;
  let ownedBookId: string | undefined;
  if (session.isLoggedIn && book.olWorkId) {
    const [existing] = await db
      .select({ id: books.id })
      .from(books)
      .where(and(eq(books.userId, session.userId), eq(books.olWorkId, book.olWorkId)))
      .limit(1);
    if (existing) { alreadyOwned = true; ownedBookId = existing.id; }
  }

  const languageLabel = book.language ? (LANGUAGE_LABELS[book.language] ?? book.language) : null;

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      <p className="text-sm text-muted-foreground mb-6">
        Alguien compartió este libro contigo
      </p>

      <div className="flex flex-col sm:flex-row gap-8 rounded-xl border border-border bg-surface p-6">
        {/* Cover */}
        <div className="shrink-0">
          <div className="relative w-36 aspect-[2/3] rounded-lg overflow-hidden bg-surface-raised border border-border shadow-lg">
            {book.coverUrl ? (
              <Image src={book.coverUrl} alt={book.title} fill sizes="144px" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold">{book.title}</h1>
            <p className="text-lg text-muted-foreground">{book.author}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {languageLabel && <span className="text-sm text-muted-foreground">{languageLabel}</span>}
              {book.year && <span className="text-sm text-muted-foreground">{formatYear(book.year)}</span>}
              {book.pages && <span className="text-sm text-muted-foreground">{formatPages(book.pages)}</span>}
            </div>
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {book.genres.slice(0, 5).map((g) => (
                  <Badge key={g} variant="outline" className="text-xs border-border text-muted-foreground">
                    {translateGenre(g)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {book.synopsis && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{book.synopsis}</p>
          )}

          <AddSharedBook
            alreadyOwned={alreadyOwned}
            ownedBookId={ownedBookId}
            book={{
              olWorkId: book.olWorkId,
              title: book.title,
              author: book.author,
              year: book.year,
              pages: book.pages,
              coverUrl: book.coverUrl,
              isbn: book.isbn,
              genres: book.genres ?? [],
              synopsis: book.synopsis,
            }}
          />
        </div>
      </div>
    </div>
  );
}
