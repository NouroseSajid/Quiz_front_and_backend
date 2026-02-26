"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGamePage() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!gameCode.trim()) {
      setError("Game code is required");
      return;
    }
    if (!playerName.trim()) {
      setError("Player name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/lobby/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameCode: gameCode.trim().toUpperCase(),
          playerName: playerName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Join failed");

      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("playerToken", data.playerToken);
      localStorage.setItem("gameId", data.gameId);

      router.push(`/lobby/${data.gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(31,111,120,0.14),_transparent_55%)] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Join Game</h2>
            <span className="text-xs text-[var(--muted)] rotate-1">comic calm</span>
          </div>
          <p className="text-sm text-[var(--muted)] mb-6">Enter the code and jump in.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Game Code</label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="e.g., FUN42"
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-[var(--accent-strong)] disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Game"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
