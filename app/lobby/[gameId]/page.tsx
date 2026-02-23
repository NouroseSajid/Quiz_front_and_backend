"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  isActive: boolean;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  useEffect(() => {
    if (!gameId) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  async function fetchStatus() {
    try {
      const res = await fetch(`/api/lobby/${gameId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPlayers(data.players || []);
      setGameCode(data.gameCode || "");
      setIsHost(playerId === data.session.hostId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startGame() {
    if (!playerId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lobby/${gameId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start");
      router.push(`/game/${gameId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="p-4">Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
        <h2 className="text-2xl font-semibold mb-4 text-center">Lobby</h2>
        <p className="text-center mb-4">Code: <span className="font-mono">{gameCode}</span></p>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <ul className="space-y-2 mb-4">
          {players.map((p) => (
            <li key={p.id} className="flex justify-between items-center">
              <span>{p.name} {p.isHost && "(host)"}</span>
              <span className="text-sm text-gray-500">{p.isActive ? "online" : "away"}</span>
            </li>
          ))}
        </ul>
        {isHost && (
          <button
            onClick={startGame}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Game"}
          </button>
        )}
      </div>
    </main>
  );
}
