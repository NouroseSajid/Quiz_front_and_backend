use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Session {
  status: string;
  checkpoint: string;
  players: Player[];
  rounds: any[];
  currentRoundIndex: number;
}

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;

  const [session, setSession] = useState<Session | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  async function fetchState() {
    try {
      const res = await fetch(`/api/lobby/${gameId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSession(data.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId) return;
    try {
      await fetch(`/api/game/${gameId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, answer }),
      });
      setAnswer("");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (!session) return <p className="p-4">No session found</p>;

  const round = session.rounds[session.currentRoundIndex] || null;
  const question = round?.questions
    ? round.questions[round.currentQuestionIndex]
    : null;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Game</h2>
        {error && <p className="text-red-500">{error}</p>}
        {question ? (
          <div>
            <p className="mb-2 font-medium">{question.text}</p>
            <form onSubmit={submitAnswer} className="flex space-x-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="flex-1 rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit
              </button>
            </form>
          </div>
        ) : (
          <p>No active question</p>
        )}
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold">Players</h3>
          <ul className="space-y-1">
            {session.players.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-sm text-gray-500">{p.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
