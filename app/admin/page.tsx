"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QuestionForm from "./input/components/QuestionForm";
import QuestionsList from "./input/components/QuestionsList";
import type { QuestionInput } from "@/lib/types";

type AdminTab = "games" | "create" | "manage";

interface Player {
  id: string;
  name: string;
  isActive: boolean;
  score: number;
}

interface LobbyInfo {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  playerCount: number;
  activePlayerCount: number;
  hostName: string | null;
  roundCount: number;
  questionCount: number;
  sessionActive: boolean;
  players: Player[];
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("games");
  const [isLoading, setIsLoading] = useState(false);
  const [lobbies, setLobbies] = useState<LobbyInfo[]>([]);
  const [lobbiesLoading, setLobbiesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedLobby, setExpandedLobby] = useState<string | null>(null);
  const [kickingPlayer, setKickingPlayer] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [creatingLobby, setCreatingLobby] = useState(false);
  const [startingLobby, setStartingLobby] = useState<string | null>(null);

  const fetchLobbies = useCallback(async () => {
    setLobbiesLoading(true);
    try {
      const res = await fetch("/api/admin/lobbies", {
        credentials: "include",
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error("[Admin] API Error:", res.status, data);
        if (res.status === 401) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => router.push("/admin/login"), 2000);
        } else {
          setError(`Failed to load lobbies: ${data.error || res.statusText}`);
        }
        return;
      }
      
      console.log("[Admin] Fetched lobbies:", data.lobbies);
      setLobbies(data.lobbies || []);
      setError("");
    } catch (err) {
      console.error("[Admin] Network error:", err);
      setError("Network error - check console");
    } finally {
      setLobbiesLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === "games") fetchLobbies();
  }, [activeTab, fetchLobbies]);

  const handleDeleteLobby = async (gameId: string) => {
    if (!confirm("Delete this game? This cannot be undone.")) return;
    setDeletingId(gameId);
    try {
      const res = await fetch("/api/admin/lobbies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
        credentials: "include",
      });
      if (res.ok) {
        setLobbies((prev) => prev.filter((l) => l.id !== gameId));
      }
    } catch { /* ignore */ } finally {
      setDeletingId(null);
    }
  };

  const handleKickPlayer = async (gameId: string, playerId: string, playerName: string) => {
    if (!confirm(`Kick ${playerName} from this lobby?`)) return;
    setKickingPlayer(playerId);
    try {
      const res = await fetch("/api/admin/kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, playerId }),
        credentials: "include",
      });
      if (res.ok) {
        // Update local state
        setLobbies((prev) =>
          prev.map((lobby) =>
            lobby.id === gameId
              ? {
                  ...lobby,
                  players: lobby.players.map((p) =>
                    p.id === playerId ? { ...p, isActive: false } : p
                  ),
                  activePlayerCount: lobby.activePlayerCount - 1,
                }
              : lobby
          )
        );
      }
    } catch { /* ignore */ } finally {
      setKickingPlayer(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { 
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  };

  const handleCreateGame = async () => {
    setCreatingLobby(true);
    setError("");
    try {
      const res = await fetch("/api/admin/create-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create game");
      
      // Store host credentials so this browser can act as host
      if (data.hostId && data.hostToken) {
        localStorage.setItem("playerId", data.hostId);
        localStorage.setItem("playerToken", data.hostToken);
        localStorage.setItem("hostId", data.hostId);
      }
      
      // Show success with game code
      alert(`Game created! Code: ${data.code}\nShare this code with players to join.`);
      
      // Refresh lobby list
      fetchLobbies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingLobby(false);
    }
  };

  const handleStartLobby = async (lobby: LobbyInfo) => {
    if (!confirm(`Start game for lobby ${lobby.code}? This will begin the game with current players.`)) {
      return;
    }

    setStartingLobby(lobby.id);
    setError("");
    try {
      const res = await fetch(`/api/lobby/${lobby.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start lobby");
      
      // Refresh the list to show updated status
      fetchLobbies();
      
      // Optionally open the game in a new tab
      if (confirm("Game started! Open host view in new tab?")) {
        window.open(`/game/${lobby.id}/host`, "_blank");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStartingLobby(null);
    }
  };

  const handleQuestionSubmit = async (question: QuestionInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error("Failed to create question");
      }

      const data = await response.json();
      console.log("Question created:", data);
      
      // Switch to manage tab after creating
      setActiveTab("manage");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            🎮 Admin Dashboard
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage "The Vibe Check" quiz game
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "create"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            ➕ Create Question
          </button>

          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "manage"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            📋 Manage Questions ({/* TODO: Add count */})
          </button>

          <button
            onClick={() => setActiveTab("games")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === "games"
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            🎯 Manage Lobbies & Players
          </button>

          <Link
            href="/"
            className="px-4 py-2 rounded-lg font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            ← Back to Home
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition ml-auto"
          >
            🚪 Logout
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          {/* Create Question Tab */}
          {activeTab === "create" && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                Create New Question
              </h2>
              <QuestionForm onSubmit={handleQuestionSubmit} isLoading={isLoading} />
            </div>
          )}

          {/* Manage Questions Tab */}
          {activeTab === "manage" && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                Manage Questions
              </h2>
              <QuestionsList />
            </div>
          )}

          {/* Active Games Tab */}
          {activeTab === "games" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  Manage Games & Players
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGame}
                    disabled={creatingLobby}
                    className="px-4 py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition font-medium"
                  >
                    {creatingLobby ? "Creating..." : "➕ Create New Game"}
                  </button>
                  <button
                    onClick={fetchLobbies}
                    disabled={lobbiesLoading}
                    className="px-3 py-2 text-sm rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition disabled:opacity-50"
                  >
                    {lobbiesLoading ? "Loading..." : "🔄 Refresh"}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">Check browser console (F12) for details</p>
                </div>
              )}
              
              {lobbiesLoading && (
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">Loading lobbies...</p>
                </div>
              )}
              {!lobbiesLoading && lobbies.length === 0 && !error ? (
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    No lobbies found.
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    Create a game from the home page to see it here.
                  </p>
                </div>
              ) : !lobbiesLoading ? (
                <div className="space-y-3">
                  {lobbies.map((lobby) => (
                    <div
                      key={lobby.id}
                      className="bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                    >
                      {/* Lobby Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">
                              {lobby.code}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                lobby.status === "LOBBY"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : lobby.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : lobby.status === "FINISHED"
                                  ? "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                            >
                              {lobby.status}
                            </span>
                            {lobby.sessionActive && (
                              <span className="text-xs text-green-600 dark:text-green-400">● live</span>
                            )}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            Host: {lobby.hostName ?? "—"} · Players: {lobby.activePlayerCount}/{lobby.playerCount} ·{" "}
                            {lobby.roundCount} rounds · {lobby.questionCount} questions
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">
                            Created: {new Date(lobby.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartLobby(lobby)}
                            disabled={startingLobby === lobby.id || lobby.status !== "LOBBY"}
                            className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                          >
                            {startingLobby === lobby.id ? "Starting..." : "▶ Start"}
                          </button>
                          <button
                            onClick={() => window.open(`/game/${lobby.id}/host`, "_blank")}
                            className="px-3 py-1.5 text-sm rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition"
                          >
                            👑 Host View
                          </button>
                          <button
                            onClick={() => setExpandedLobby(expandedLobby === lobby.id ? null : lobby.id)}
                            className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                          >
                            {expandedLobby === lobby.id ? "▲ Hide" : "▼ Show"} Players
                          </button>
                          <button
                            onClick={() => handleDeleteLobby(lobby.id)}
                            disabled={deletingId === lobby.id}
                            className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition"
                          >
                            {deletingId === lobby.id ? "Deleting..." : "🗑 Delete"}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Player List */}
                      {expandedLobby === lobby.id && (
                        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
                          <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                            Players ({lobby.players.length})
                          </h4>
                          {lobby.players.length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No players in this lobby</p>
                          ) : (
                            <div className="space-y-2">
                              {lobby.players.map((player) => (
                                <div
                                  key={player.id}
                                  className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`text-sm ${player.isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-600 line-through"}`}>
                                      {player.name}
                                    </span>
                                    {player.isHost && (
                                      <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                                        HOST
                                      </span>
                                    )}
                                    {!player.isActive && (
                                      <span className="text-xs text-red-500">inactive</span>
                                    )}
                                  </div>
                                  {player.isActive && (
                                    <button
                                      onClick={() => handleKickPlayer(lobby.id, player.id, player.name)}
                                      disabled={kickingPlayer === player.id}
                                      className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition"
                                    >
                                      {kickingPlayer === player.id ? "Kicking..." : "👢 Kick"}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Info Panels */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              📊 Quick Stats
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>Total Questions: <strong>—</strong></li>
              <li>Active Games: <strong>0</strong></li>
              <li>Players Online: <strong>0</strong></li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              ✅ Latest Questions
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              Create or manage questions to populate this list.
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🚀 Next Steps
            </h3>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
              <li>✓ Create 5+ questions</li>
              <li>⊙ Build game lobby</li>
              <li>⊙ Add real-time sync</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
