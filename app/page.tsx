"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastGameId, setLastGameId] = useState<string | null>(null);

  useEffect(() => {
    fetchLobbies();
    if (typeof window !== "undefined") {
      setLastGameId(localStorage.getItem("gameId"));
    }
  }, []);

  async function fetchLobbies() {
    try {
      const res = await fetch("/api/lobby");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch lobbies");
      setLobbies(data.lobbies || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function joinLobby(gameId: string) {
    if (!playerName.trim()) {
      setError("Player name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/lobby/${gameId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join lobby");
      if (data.playerId) localStorage.setItem("playerId", data.playerId);
      if (data.playerToken) localStorage.setItem("playerToken", data.playerToken);
      localStorage.setItem("gameId", data.gameId || gameId);
      router.push(`/lobby/${data.gameId || gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(31,111,120,0.14),_transparent_55%)]">
        <header className="max-w-6xl mx-auto px-6 pt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-black">
              Q
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Welcome to</p>
              <h1 className="text-2xl font-bold">Quiz Central</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/join")}
              className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] transition"
            >
              Join Game
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="px-4 py-2 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] transition"
            >
              Admin
            </button>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 pt-10 pb-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-3 py-1 text-sm">
              <span className="text-[var(--accent-pop)]">★</span>
              <span>Pop quiz energy, clean layout</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Host and join quizzes in seconds.
            </h2>
            <p className="text-[var(--muted)] text-lg max-w-xl">
              Enter your name once, pick a lobby, and you are in. Minimal steps, playful vibe.
            </p>
            {lastGameId && (
              <button
                onClick={() => router.push(`/lobby/${lastGameId}`)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-pop)] text-white font-semibold hover:opacity-90 transition"
              >
                Resume last lobby
              </button>
            )}
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick join</h3>
              <span className="text-xs text-[var(--muted)] rotate-1">(no fuss)</span>
            </div>
            <label htmlFor="playerName" className="block text-sm font-medium mb-2">
              Your name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Add a name for the leaderboard"
            />
            {error && <p className="text-[var(--danger)] text-sm mt-3">{error}</p>}
            <div className="mt-4 text-xs text-[var(--muted)]">
              Lobbies are created by admins. Pick one below to jump in.
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Open lobbies</h3>
            <button
              onClick={fetchLobbies}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="text-[var(--muted)]">Loading lobbies...</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {lobbies.map((lobby: any) => (
                <li key={lobby.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Lobby {lobby.code}</p>
                      <p className="text-sm text-[var(--muted)]">
                        Players: {lobby.activePlayerCount ?? lobby.playerCount}/{lobby.playerCount}
                        {!lobby.isActive && " (inactive)"}
                      </p>
                    </div>
                    <button
                      onClick={() => joinLobby(lobby.id)}
                      disabled={!lobby.isActive}
                      className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] disabled:opacity-50"
                    >
                      Join
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
