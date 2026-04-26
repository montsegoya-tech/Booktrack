import type { BookSelect } from "@/lib/db/schema";
import BookRow from "./BookRow";

export default function BookList({ books }: { books: BookSelect[] }) {
  return (
    <div className="space-y-2">
      {books.map((book) => (
        <BookRow key={book.id} book={book} />
      ))}
    </div>
  );
}
