"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function DeleteBookButton({
  bookId,
  className,
}: {
  bookId: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      toast.success("Libro eliminado");
      router.push("/library");
    } catch {
      toast.error("Error al eliminar");
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn("text-muted-foreground hover:text-destructive", className)}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar libro?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El libro será eliminado de tu biblioteca.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
