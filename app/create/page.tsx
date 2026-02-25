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
          playerName: playerName.trim()
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Join failed");
      
      // Store player identifiers
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold mb-2 text-center text-white">Join Game</h2>
        <p className="text-center text-gray-200 mb-6">Enter the game code to join a quiz</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Game Code</label>
            <input
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              placeholder="e.g., FUN42"
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          
          {error && <p className="text-red-300 text-sm bg-red-500/20 p-2 rounded">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200"
          >
            {loading ? "Joining..." : "Join Game"}
          </button>
        </form>
      </div>
    </main>
  );
}
