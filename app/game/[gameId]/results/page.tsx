"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface GameResult {
  id: string;
  name: string;
  score: number;
  rank: number;
}

interface QuestionStat {
  text: string;
  pointsEarned: number;
  wasCorrect: boolean;
}

export default function GameResultsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [results, setResults] = useState<GameResult[]>([]);
  const [playerStats, setPlayerStats] = useState<{ best: QuestionStat; worst: QuestionStat } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  useEffect(() => {
    fetchResults();
  }, [gameId]);

  async function fetchResults() {
    try {
      const res = await fetch(`/api/lobby/${gameId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch results");

      const session = data.session;
      const playerList = Array.isArray(session.players)
        ? session.players
        : Object.values(session.players || {});
      const sorted = [...playerList].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });
      const ranked = sorted.map((p, idx) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        rank: idx + 1,
      }));

      setResults(ranked);

      // TODO: Fetch player-specific stats when implemented
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-xl">Loading results...</p>
        </div>
      </div>
    );
  }

  const playerResult = results.find((r) => r.id === playerId);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-6xl font-black text-white mb-2">🎉 Game Over!</h1>
          <p className="text-xl text-purple-200">Here are the final results</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Final Leaderboard */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Final Leaderboard</h2>
          <div className="space-y-3">
            {results.map((result) => {
              const isPlayer = result.id === playerId;
              const medal = result.rank <= 3 ? medals[result.rank - 1] : `#${result.rank}`;

              return (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg transition-all border-2 ${
                    isPlayer
                      ? "bg-yellow-100/20 border-yellow-400 shadow-lg"
                      : "bg-white/10 border-transparent hover:bg-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{medal}</span>
                      <div>
                        <h3 className={`text-lg font-bold ${isPlayer ? "text-yellow-300" : "text-white"}`}>
                          {result.name}
                          {isPlayer && <span className="text-sm ml-2">(You)</span>}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black text-yellow-300">{result.score.toLocaleString()}</div>
                      <div className="text-xs text-purple-200">points</div>
                    </div>
                  </div>

                  {/* Score Bar */}
                  <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((result.score / (results[0]?.score || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Personal Stats */}
        {playerResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Rank Card */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90">Your Final Rank</div>
              <div className="text-5xl font-black my-3">#{playerResult.rank}</div>
              <div className="text-sm opacity-90">out of {results.length} players</div>
            </div>

            {/* Score Card */}
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm opacity-90">Your Total Score</div>
              <div className="text-5xl font-black my-3">{playerResult.score.toLocaleString()}</div>
              <div className="text-sm opacity-90">
                {playerResult.rank === 1
                  ? "🏆 Champion!"
                  : `${(results[0]?.score - playerResult.score).toLocaleString()} behind 1st`}
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="text-center">
            <div className="text-3xl font-black text-yellow-300">{results.length}</div>
            <div className="text-xs text-purple-200 mt-1">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-pink-300">{(results[0]?.score || 0).toLocaleString()}</div>
            <div className="text-xs text-purple-200 mt-1">Top Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-300">
              {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length).toLocaleString()}
            </div>
            <div className="text-xs text-purple-200 mt-1">Avg Score</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-white text-indigo-900 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
          >
            🏠 Home
          </button>
          <button
            onClick={() => router.push("/create")}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-lg"
          >
            🎮 Play Again
          </button>
        </div>

        {/* Celebratory Message */}
        <div className="text-center text-white/80 text-sm">
          {playerResult?.rank === 1 ? (
            <p className="text-2xl">🏆 Congratulations! You won! 🏆</p>
          ) : playerResult && playerResult.rank <= 3 ? (
            <p className="text-xl">Nice! You earned a spot on the podium! 🎖️</p>
          ) : (
            <p className="text-lg">Thanks for playing! Better luck next time! 💪</p>
          )}
        </div>
      </div>
    </main>
  );
}
