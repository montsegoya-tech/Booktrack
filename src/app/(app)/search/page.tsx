import { Suspense } from "react";
import { searchBooks } from "@/lib/openlibrary/client";
import { transformSearchResult } from "@/lib/openlibrary/helpers";
import { searchGoogleBooks } from "@/lib/googlebooks/client";
import { transformGBResult } from "@/lib/googlebooks/helpers";
import SearchInput from "@/components/search/SearchInput";
import SearchResultCard from "@/components/search/SearchResultCard";
import AddBookManually from "@/components/search/AddBookManually";
import { Search } from "lucide-react";
import type { BookSearchItem } from "@/types";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let results: BookSearchItem[] = [];

  if (q) {
    const [olResults, gbResults] = await Promise.allSettled([
      searchBooks(q).then((d) => d.docs.map(transformSearchResult)),
      searchGoogleBooks(q).then((d) => (d.items ?? []).map(transformGBResult)),
    ]);

    const ol = olResults.status === "fulfilled" ? olResults.value : [];
    const gb = gbResults.status === "fulfilled" ? gbResults.value : [];

    // Merge and deduplicate by ISBN
    const seen = new Set<string>();
    const merged: BookSearchItem[] = [];

    for (const book of [...ol, ...gb]) {
      const key = book.isbn ?? book.olWorkId;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(book);
      }
    }

    results = merged;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-bold">Buscar libros</h1>
        <p className="text-[#0f172a] text-sm">Busca en Open Library y Google Books simultáneamente</p>
      </div>

      <Suspense>
        <SearchInput />
      </Suspense>

      {q && results.length === 0 && (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <Search className="w-8 h-8 text-[#0f172a]" />
          <p className="text-[#0f172a]">No se encontraron resultados para &ldquo;{q}&rdquo;</p>
          <p className="text-sm text-[#0f172a]">Prueba con otro título, el autor o el ISBN</p>
        </div>
      )}

      {!q && (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Search className="w-8 h-8 text-[#0f172a]" />
          <p className="text-[#0f172a]">Escribe para buscar libros</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#0f172a]">{results.length} resultados para &ldquo;{q}&rdquo;</p>
          <div className="space-y-2">
            {results.map((book) => (
              <SearchResultCard key={book.olWorkId} book={book} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-6">
        <AddBookManually />
      </div>
    </div>
  );
}
