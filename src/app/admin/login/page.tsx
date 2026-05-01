"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Nao foi possivel entrar.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0B0F14] px-4 text-white">
      <GlassCard className="w-full max-w-md space-y-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Login admin</h1>
            <p className="text-sm text-[#A9B4C3]">Acesse o painel AcessoPro</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={submit}>
          <input
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none focus:border-cyan-300/50"
            placeholder="Login"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
          <input
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none focus:border-cyan-300/50"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {message ? <p className="text-sm text-cyan-100">{message}</p> : null}
          <NeonButton className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </NeonButton>
        </form>
      </GlassCard>
    </main>
  );
}
