import { Suspense } from "react";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import type { BookSelect } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Topbar from "@/components/layout/Topbar";
import BookGrid from "@/components/library/BookGrid";
import BookList from "@/components/library/BookList";
import EmptyState from "@/components/library/EmptyState";
import ViewToggle from "@/components/library/ViewToggle";
import FilterBar from "@/components/library/FilterBar";
import GenreFilter from "@/components/library/GenreFilter";
import LibrarySearch from "@/components/library/LibrarySearch";
import Pagination from "@/components/library/Pagination";
import RecommendationsModal from "@/components/library/RecommendationsModal";
import NextBookModal from "@/components/library/NextBookModal";
import { translateGenre } from "@/lib/genres";

const PAGE_SIZE = 18;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; genre?: string; format?: string; language?: string; view?: string; q?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");

  const params = await searchParams;
  const { status, genre, format, language, view = "grid", q, page: pageParam } = params;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const conditions = [eq(books.userId, session.userId)];
  if (status) conditions.push(eq(books.status, status as BookSelect["status"]));
  if (format) conditions.push(eq(books.format, format as BookSelect["format"]));
  if (genre) conditions.push(sql`${books.genres} @> ARRAY[${genre}]::text[]`);
  if (language) conditions.push(sql`${books.language} = ${language}`);
  if (q) conditions.push(sql`(lower(${books.title}) like ${"%" + q.toLowerCase() + "%"} or lower(${books.author}) like ${"%" + q.toLowerCase() + "%"})`);

  const [allBooks, filteredCountResult] = await Promise.all([
    db
      .select()
      .from(books)
      .where(and(...conditions))
      .orderBy(
        sql`CASE ${books.status} WHEN 'reading' THEN 0 WHEN 'to_read' THEN 1 WHEN 'read' THEN 2 END`,
        desc(books.addedAt)
      )
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(and(...conditions)),
  ]);

  const filteredCount = Number(filteredCountResult[0]?.count ?? 0);
  const totalPages = Math.ceil(filteredCount / PAGE_SIZE);

  const genreRows = await db
    .select({ genre: sql<string>`unnest(${books.genres})` })
    .from(books)
    .where(eq(books.userId, session.userId));

  // Deduplicate by translated label so "Fiction" and "fiction" don't both show as "Ficción"
  const seenLabels = new Set<string>();
  const userGenres = genreRows
    .map((r) => r.genre)
    .filter((g) => {
      const label = translateGenre(g);
      if (seenLabels.has(label)) return false;
      seenLabels.add(label);
      return true;
    })
    .sort((a, b) => translateGenre(a).localeCompare(translateGenre(b), "es"));

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(books)
    .where(eq(books.userId, session.userId));
  const count = Number(totalResult[0]?.count ?? 0);


  return (
    <div className="flex flex-col h-full">
      <Suspense>
        <Topbar bookCount={count} username={session.username} />
      </Suspense>

      <div className="flex-1 p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Suspense>
            <FilterBar />
          </Suspense>
          <div className="flex items-center gap-2 ml-auto">
            <NextBookModal />
            <RecommendationsModal />
            <Suspense>
              <ViewToggle />
            </Suspense>
          </div>
        </div>

        <Suspense>
          <LibrarySearch />
        </Suspense>

        <Suspense>
          <GenreFilter genres={userGenres} />
        </Suspense>

        {allBooks.length === 0 ? (
          <EmptyState />
        ) : view === "list" ? (
          <BookList books={allBooks} />
        ) : (
          <BookGrid books={allBooks} />
        )}

        <Suspense>
          <Pagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
