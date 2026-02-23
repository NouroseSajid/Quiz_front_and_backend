"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLobbies();
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
      router.push(`/lobby/${gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-6">Quiz Application</h1>
        <div className="max-w-md mx-auto bg-white p-6 shadow rounded mb-6">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your name to join a lobby
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        </div>
        {loading ? (
          <p>Loading lobbies...</p>
        ) : (
          <ul className="space-y-4">
            {lobbies.map((lobby: any) => (
              <li key={lobby.id} className="bg-gray-100 p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Lobby Code: {lobby.code}</span>
                  <button
                    onClick={() => joinLobby(lobby.id)}
                    className="py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Join
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
