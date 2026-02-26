"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSocket } from "@/lib/useSocket";

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface Session {
  status: string;
  hostId: string;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [rejoinAttempted, setRejoinAttempted] = useState(false);

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  // Initialize Socket.io
  useSocket(gameId, () => {
    fetchStatus();
  });

  useEffect(() => {
    if (!gameId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/lobby/${gameId}?playerId=${playerId || ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      const isGameActive = data.status === "ACTIVE" || data.session?.status === "PLAYING";
      if (isGameActive) {
        if (playerId) {
          router.push(`/game/${gameId}`);
        }
        return;
      }
      
      // Get all players - handle both array and object formats
      const playerList = Array.isArray(data.players) 
        ? data.players 
        : Object.values(data.players || {});
      
      setPlayers(playerList);
      setGameCode(data.gameCode || data.code || "");
      setSession(data.session);

      if (!rejoinAttempted && playerId) {
        const inLobby = playerList.some((p: Player) => p.id === playerId);
        if (!inLobby) {
          await attemptRejoin();
        }
        setRejoinAttempted(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function attemptRejoin() {
    const playerToken = typeof window !== "undefined" ? localStorage.getItem("playerToken") : null;
    if (!playerId || !playerToken) return;
    try {
      const res = await fetch(`/api/lobby/${gameId}/rejoin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rejoin");
    } catch (err: any) {
      console.error("Rejoin failed:", err.message);
    }
  }

  async function leaveLobby() {
    const playerToken = typeof window !== "undefined" ? localStorage.getItem("playerToken") : null;
    if (!playerId || !playerToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lobby/${gameId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to leave");
      localStorage.removeItem("gameId");
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const currentPlayer = players.find(p => p.id === playerId);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border)] border-t-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-[var(--muted)] text-lg">Loading lobby...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-2 text-sm mb-3">
            <span className="text-[var(--accent-pop)]">✦</span>
            <span>Lobby mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Game Lobby</h1>
          <div className="inline-block bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-6 py-3">
            <p className="text-[var(--muted)] text-sm mb-1">Game Code</p>
            <p className="text-3xl font-mono font-bold tracking-widest">{gameCode || "---"}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[var(--surface)] border border-[var(--danger)] rounded-lg text-[var(--danger)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players Section */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>👥 Players in Lobby</span>
                  <span className="bg-[var(--surface-muted)] px-3 py-1 rounded-full text-sm">
                    {players.length}
                  </span>
                </h2>
              </div>

              {players.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[var(--muted)] text-lg mb-2">Waiting for players...</p>
                  <p className="text-[var(--muted)]">Share the code <span className="font-mono font-bold">{gameCode}</span> to invite others</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedPlayers.map((player, idx) => {
                    const isYou = player.id === playerId;
                    const medals = ["🥇", "🥈", "🥉"];
                    const medal = medals[idx] || `#${idx + 1}`;

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                          isYou
                            ? "bg-[var(--surface-muted)] border-2 border-[var(--accent)] shadow-sm"
                            : player.isActive
                            ? "bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]"
                            : "bg-[var(--surface-muted)] border border-[var(--border)] opacity-75"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{medal}</div>
                          <div>
                            <p className="font-semibold flex items-center gap-2">
                              {player.name}
                              {isYou && <span className="text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full">YOU</span>}
                            </p>
                            <p className="text-sm text-[var(--muted)]">
                              {player.isActive ? "🟢 Online" : "⚫ Away"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[var(--accent-pop)]">{player.score}</p>
                          <p className="text-xs text-[var(--muted)]">Points</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentPlayer && (
                <button
                  onClick={leaveLobby}
                  disabled={loading}
                  className="w-full mt-6 py-3 px-4 bg-[var(--danger)] hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                >
                  Leave Lobby
                </button>
              )}
            </div>
          </div>

          {/* Info & Instructions */}
          <div className="space-y-4">
            {/* Lobby Status */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>ℹ️ Game Status</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[var(--muted)] text-sm">Status</p>
                  <p className="font-semibold">
                    {session?.status === "LOBBY" ? (
                      <span className="inline-block bg-[var(--surface-muted)] text-[var(--warning)] px-3 py-1 rounded-full text-sm border border-[var(--border)]">
                        🟡 Waiting to Start
                      </span>
                    ) : (
                      <span className="inline-block bg-[var(--surface-muted)] text-[var(--success)] px-3 py-1 rounded-full text-sm border border-[var(--border)]">
                        🟢 Active
                      </span>
                    )}
                  </p>
                </div>
                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-[var(--muted)] text-sm mb-2">Quick Tips</p>
                  <ul className="space-y-1 text-[var(--muted)] text-sm">
                    <li>✓ Share code with friends</li>
                    <li>✓ Wait for game to start</li>
                    <li>✓ Admin will begin questions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Share Code */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Invite others</h3>
              <div className="bg-[var(--surface-muted)] rounded-lg p-3 mb-3">
                <p className="text-[var(--muted)] text-xs mb-2">Share this code:</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-center mb-3">
                  {gameCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(gameCode);
                    alert("Code copied to clipboard!");
                  }}
                  className="w-full py-2 px-3 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white rounded-lg text-sm font-semibold transition"
                >
                  Copy Code
                </button>
              </div>
              <p className="text-[var(--muted)] text-xs">
                Players can join using the code on the home page
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
