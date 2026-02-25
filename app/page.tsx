"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
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
      router.push(`/lobby/${gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {/* Navigation Dropdown Button */}
      <div className="absolute top-6 right-6">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg transition"
          >
            ☰ Navigation
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
              <nav className="py-2">
                <button
                  onClick={() => {
                    router.push("/");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 transition"
                >
                  🏠 Home
                </button>
                <button
                  onClick={() => {
                    router.push("/join");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 transition"
                >
                  🎮 Join Game
                </button>
                <button
                  onClick={() => {
                    router.push("/admin/login");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 border-t transition"
                >
                  ⚙️ Admin Panel
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

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
          {lastGameId && (
            <button
              onClick={() => router.push(`/lobby/${lastGameId}`)}
              className="w-full py-2 px-4 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Open Last Lobby
            </button>
          )}
        </div>
        
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Lobbies are created by admins. Join an existing lobby below or contact an admin to create a new one.
            </p>
          </div>
        </div>

        {loading ? (
          <p>Loading lobbies...</p>
        ) : (
          <ul className="space-y-4">
            {lobbies.map((lobby: any) => (
              <li key={lobby.id} className="bg-gray-100 p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">Lobby Code: {lobby.code}</span>
                    <div className="text-sm text-gray-600">
                      Players: {lobby.activePlayerCount ?? lobby.playerCount}/{lobby.playerCount}
                      {!lobby.isActive && " (inactive)"}
                    </div>
                  </div>
                  <button
                    onClick={() => joinLobby(lobby.id)}
                    disabled={!lobby.isActive}
                    className="py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
