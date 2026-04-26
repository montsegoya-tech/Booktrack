import { db } from "@/lib/db";
import { books, readingGoals } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { translateGenre } from "@/lib/genres";
import { ReadingChallengeWidget } from "@/components/stats/ReadingChallengeWidget";
import { MonthlyReadingChart } from "@/components/stats/MonthlyReadingChart";

const KNOWN_GENRES = new Set([
  "Fiction", "Nonfiction", "Non-fiction", "Fantasy", "Science Fiction", "Mystery", "Thriller",
  "Horror", "Romance", "Drama", "Comedy", "Adventure", "Action", "Poetry", "Short Stories",
  "Graphic Novel", "Children's Fiction", "Young Adult", "Young Adult Fiction", "Classic Literature",
  "Historical Fiction", "Literary Fiction", "Spanish Literature", "Catalan Literature",
  "Latin American Literature", "History", "Biography", "Autobiography", "Memoir", "Philosophy",
  "Psychology", "Science", "Technology", "Politics", "Economics", "Business", "Self-help",
  "Self Help", "Health", "Travel", "Cooking", "Art", "Music", "Sports", "Religion",
  "Spirituality", "Education", "Language", "Nature", "Environment", "Feminism",
  "Social Issues", "Coming of Age", "Family", "Love", "War",
]);
import { BarChart3, BookOpen, BookMarked, Clock, Star, FileText, User } from "lucide-react";

export default async function StatsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");

  const currentYear = new Date().getFullYear();

  const [allBooks, goalRow] = await Promise.all([
    db.select().from(books).where(eq(books.userId, session.userId)),
    db.select().from(readingGoals).where(
      and(eq(readingGoals.userId, session.userId), eq(readingGoals.year, currentYear))
    ).then(([r]) => r ?? null),
  ]);

  const booksReadThisYear = allBooks.filter((b) => {
    if (b.status !== "read") return false;
    const date = b.readAt ?? b.updatedAt;
    return date ? new Date(date).getFullYear() === currentYear : false;
  }).length;

  const total = allBooks.length;
  const read = allBooks.filter((b) => b.status === "read").length;
  const reading = allBooks.filter((b) => b.status === "reading").length;
  const toRead = allBooks.filter((b) => b.status === "to_read").length;

const rated = allBooks.filter((b) => b.rating !== null);
  const avgRating = rated.length
    ? (rated.reduce((acc, b) => acc + (b.rating ?? 0), 0) / rated.length).toFixed(1)
    : null;

  const totalPages = allBooks
    .filter((b) => b.status === "read" && b.pages)
    .reduce((acc, b) => acc + (b.pages ?? 0), 0);

  // Genre frequency — only known genres
  const genreCount: Record<string, number> = {};
  for (const b of allBooks) {
    for (const g of b.genres ?? []) {
      if (KNOWN_GENRES.has(g)) genreCount[g] = (genreCount[g] ?? 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Author stats — only read books
  const authorMap: Record<string, { count: number; ratingSum: number; ratingCount: number }> = {};
  for (const b of allBooks) {
    if (b.status !== "read") continue;
    const a = b.author;
    if (!authorMap[a]) authorMap[a] = { count: 0, ratingSum: 0, ratingCount: 0 };
    authorMap[a].count++;
    if (b.rating) { authorMap[a].ratingSum += b.rating; authorMap[a].ratingCount++; }
  }
  const topAuthors = Object.entries(authorMap)
    .sort((a, b) => b[1].count - a[1].count || b[1].ratingSum / (b[1].ratingCount || 1) - a[1].ratingSum / (a[1].ratingCount || 1))
    .slice(0, 6)
    .map(([name, s]) => ({
      name,
      count: s.count,
      avg: s.ratingCount > 0 ? (s.ratingSum / s.ratingCount).toFixed(1) : null,
    }));
  const maxAuthorCount = topAuthors[0]?.count ?? 1;

  // Books read per year+month
  const readByYearMonth: Record<number, number[]> = {};
  for (const b of allBooks) {
    if (b.status !== "read") continue;
    const date = b.readAt ?? b.updatedAt;
    if (!date) continue;
    const d = new Date(date);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (!readByYearMonth[y]) readByYearMonth[y] = Array(12).fill(0) as number[];
    readByYearMonth[y][m]++;
  }
  const availableYears = Object.keys(readByYearMonth).map(Number).sort((a, b) => b - a);
  const hasMonthData = availableYears.length > 0;

  // Books per year added
  const byYear: Record<string, number> = {};
  for (const b of allBooks) {
    if (b.addedAt) {
      const y = new Date(b.addedAt).getFullYear().toString();
      byYear[y] = (byYear[y] ?? 0) + 1;
    }
  }
  const years = Object.entries(byYear).sort((a, b) => a[0].localeCompare(b[0]));
  const maxYear = Math.max(...years.map(([, v]) => v), 1);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 bg-white border-b border-border flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold leading-tight">Estadísticas</h1>
          <p className="text-xs text-muted-foreground">{total} libros en tu biblioteca</p>
        </div>
      </header>

      <div className="p-8 max-w-4xl mx-auto space-y-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<BookOpen className="w-7 h-7" />} label="Total libros" value={total} />
          <StatCard icon={<BookMarked className="w-7 h-7" />} label="Leídos" value={read} />
          <StatCard icon={<Clock className="w-7 h-7" />} label="Leyendo" value={reading} />
          <StatCard icon={<FileText className="w-7 h-7" />} label="Por leer" value={toRead} />
        </div>

        {/* Reading challenge */}
        <ReadingChallengeWidget
          year={currentYear}
          initialGoal={goalRow?.goal ?? null}
          booksReadThisYear={booksReadThisYear}
        />

        {/* Books read per month */}
        {hasMonthData && (
          <MonthlyReadingChart
            dataByYear={readByYearMonth}
            availableYears={availableYears}
            defaultYear={availableYears[0]}
          />
        )}

        {/* Progress bar by status */}
        {total > 0 && (
          <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Estado</h2>
            <div className="space-y-3">
              <ProgressRow label="Leídos" count={read} total={total} color="bg-primary" />
              <ProgressRow label="Leyendo" count={reading} total={total} color="bg-primary/60" />
              <ProgressRow label="Por leer" count={toRead} total={total} color="bg-primary/30" />
            </div>
          </section>
        )}

{/* Rating + pages */}
        <div className="grid grid-cols-2 gap-4">
          {avgRating && (
            <div className="rounded-3xl border border-border bg-card p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{avgRating}<span className="text-sm font-normal text-muted-foreground">/5</span></p>
                <p className="text-xs text-muted-foreground">Rating medio · {rated.length} valorados</p>
              </div>
            </div>
          )}
          {totalPages > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalPages.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Páginas leídas</p>
              </div>
            </div>
          )}
        </div>

        {/* Top genres */}
        {topGenres.length > 0 && (
          <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Géneros favoritos</h2>
            <div className="space-y-3">
              {topGenres.map(([genre, count]) => (
                <ProgressRow key={genre} label={translateGenre(genre)} count={count} total={total} color="bg-primary" />
              ))}
            </div>
          </section>
        )}

        {/* Top authors */}
        {topAuthors.length > 0 && (
          <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Autores favoritos</h2>
            <div className="space-y-3">
              {topAuthors.map(({ name, count, avg }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm flex-1 truncate">{name}</span>
                  <div className="w-32 h-2.5 rounded-full bg-black/10 overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(count / maxAuthorCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-24 text-right shrink-0">
                    {count} {count === 1 ? "libro" : "libros"}{avg ? ` · ★${avg}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Books added per year */}
        {years.length > 1 && (
          <section className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Libros añadidos por año</h2>
            <div className="flex items-end gap-3 h-32">
              {years.map(([year, count]) => (
                <div key={year} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-muted-foreground">{count}</span>
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-primary to-primary/50"
                    style={{ height: `${(count / maxYear) * 96}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {total === 0 && (
          <p className="text-center text-muted-foreground py-16">Añade libros a tu biblioteca para ver estadísticas.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-border bg-card px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-32 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-black/10 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-16 text-right">{count} · {pct}%</span>
    </div>
  );
}

