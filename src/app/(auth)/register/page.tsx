"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.status === 409) { toast.error("Ese nombre de usuario ya existe"); return; }
      if (!res.ok) { toast.error(data.error ?? "Error al registrarse"); return; }
      toast.success("Cuenta creada correctamente");
      router.push("/library");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="font-heading text-3xl font-bold">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm">Únete a Booktrack</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
          className="bg-surface border-border"
        />
        <Input
          type="password"
          placeholder="Contraseña (mín. 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="bg-surface border-border"
        />
        <Input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className="bg-surface border-border"
        />
        <Button type="submit" className="w-full" disabled={loading || !username || !password || !confirm}>
          {loading ? "Creando cuenta..." : "Registrarse"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
