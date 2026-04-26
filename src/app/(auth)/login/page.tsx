"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/library");
      } else {
        toast.error("Usuario o contraseña incorrectos");
        setPassword("");
      }
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
        <h1 className="font-heading text-3xl font-bold">Booktrack</h1>
        <p className="text-muted-foreground text-sm">Tu lista de lectura personal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
          className="bg-surface border-border"
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="bg-surface border-border"
        />
        <Button type="submit" className="w-full" disabled={loading || !username || !password}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Link href="/register" className="text-primary hover:underline">
            Registrarse
          </Link>
          <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
            ¿Has olvidado tu contraseña?
          </Link>
        </div>
      </form>
    </div>
  );
}
