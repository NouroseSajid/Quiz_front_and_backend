"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnswerInput } from "@/app/components/AnswerInput";
import { ResultsDisplay } from "@/app/components/ResultsDisplay";
import { useGameTimer } from "@/lib/useGameTimer";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Session {
  status: string;
  checkpoint: string;
  players: Player[] | Record<string, Player>;
  rounds: any[];
  currentRoundIndex: number;
  hostId?: string;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
  const playerToken = typeof window !== "undefined" ? localStorage.getItem("playerToken") : null;

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Get current round and question
  const currentRound = session?.rounds[session?.currentRoundIndex];
  const currentQuestion = currentRound?.questions?.[currentRound?.currentQuestionIndex];

  // Debug logging
  useEffect(() => {
    if (session) {
      console.log('[Game Page] Session:', {
        rounds: session.rounds?.length,
        currentRoundIndex: session.currentRoundIndex,
        currentRound: currentRound ? {
          id: currentRound.id,
          questionCount: currentRound.questions?.length,
          currentQuestionIndex: currentRound.currentQuestionIndex,
        } : 'none',
        currentQuestion: currentQuestion ? {
          id: currentQuestion.id,
          text: currentQuestion.text?.substring(0, 50),
          type: currentQuestion.type,
        } : 'none',
      });
    }
  }, [session, currentRound, currentQuestion]);

  // Use the custom timer hook
  const { timeLeft } = useGameTimer(
    currentQuestion?.startedAt ? new Date(currentQuestion.startedAt) : new Date(),
    currentQuestion?.timeLimit || 30,
    async () => {
      // Auto-reveal when timer hits 0 (only if not already revealed)
      if (!playerId || !playerToken || !gameId || currentQuestion?.revealed) return;
      try {
        const round = session?.rounds[session?.currentRoundIndex];
        const question = round?.questions?.[round?.currentQuestionIndex];
        if (!question) return;

        await fetch(`/api/game/${gameId}/reveal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            playerToken,
            questionId: question.id,
          }),
        });
        await fetchState();
      } catch (err) {
        console.error("Auto-reveal failed:", err);
      }
    }
  );

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

  async function submitAnswer(answer: any) {
    if (!playerId || !playerToken) return;
    try {
      const res = await fetch(`/api/game/${gameId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playerId, 
          playerToken,
          answer 
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }

      await fetchState();
    } catch (err: any) {
      throw err;
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (!session) return <p className="p-4">No session found</p>;

  // Redirect host to host page
  if (session && playerId && playerId === session.hostId) {
    // Don't render, redirect instead
    useEffect(() => {
      router.push(`/game/${gameId}/host`);
    }, []);
    return null;
  }

  // Navigate to results page when game ends
  if (session.checkpoint === "GAME_END") {
    useEffect(() => {
      router.push(`/game/${gameId}/results`);
    }, []);
    return null;
  }

  const round = currentRound;
  const question = currentQuestion;
  const playerList = Array.isArray(session.players)
    ? session.players
    : Object.values(session.players || {});

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Game</h1>
              <p className="text-sm text-gray-600">
                Round {session.currentRoundIndex + 1} • {round?.category || "Loading"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {playerList.find((p) => p.id === playerId)?.score || 0}
              </p>
              <p className="text-xs text-gray-600">Your Score</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {question ? (
          <>
            {question.revealed || session.checkpoint === "QUESTION_RESULTS" ? (
              <ResultsDisplay
                question={question}
                players={playerList}
                results={Object.entries(question.answers).map(([playerId, answer]) => {
                  const player = playerList.find((p) => p.id === playerId);
                  const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correct);
                  return {
                    id: playerId,
                    name: player?.name || "Unknown",
                    answer,
                    correct: isCorrect,
                    pointsEarned: isCorrect ? question.pointsMax : 0,
                    timeMs: 0,
                  };
                })}
                isHost={playerId === session.hostId}
              />
            ) : (
              <AnswerInput
                questionType={question.type}
                questionText={question.text}
                metadata={question.metadata}
                onSubmit={submitAnswer}
                timeLeft={timeLeft}
                gameId={gameId}
                playerId={playerId || undefined}
                playerToken={playerToken || undefined}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-lg text-gray-600 mb-2">Waiting for next question...</p>
            <div className="animate-pulse flex justify-center gap-1">
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-3">Leaderboard</h3>
          <div className="space-y-2">
            {playerList
              .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.name.localeCompare(b.name);
              })
              .map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    p.id === playerId ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-600 min-w-6">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </span>
                    <span className={p.id === playerId ? "font-bold" : ""}>
                      {p.name}
                      {p.id === playerId && " (You)"}
                    </span>
                  </div>
                  <span className="font-bold text-lg">{p.score}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
