import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold">Tu biblioteca está vacía</h2>
        <p className="text-muted-foreground text-sm">Busca un libro y añádelo con un clic</p>
      </div>
      <Link
        href="/search"
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Buscar libros
      </Link>
    </div>
  );
}
