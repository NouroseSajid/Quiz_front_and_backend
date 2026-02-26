"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !code.trim()) {
      setError("Name and code are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/lobby/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name, gameCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Join failed");
      localStorage.setItem("playerId", data.playerId);
      if (data.playerToken) {
        localStorage.setItem("playerToken", data.playerToken);
      }
      localStorage.setItem("gameId", data.gameId || code);
      router.push(`/lobby/${data.gameId || code}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,107,76,0.14),_transparent_55%)] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Join Lobby</h2>
            <span className="text-xs text-[var(--muted)] rotate-1">quick and cozy</span>
          </div>
          <p className="text-sm text-[var(--muted)] mb-6">
            Pop in the code and your name. We will handle the rest.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Ada, Sam, Noura..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Game Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="QUIZ7"
              />
            </div>
            {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-strong)] disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </form>
          <button
            onClick={() => router.push("/")}
            className="w-full mt-4 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
