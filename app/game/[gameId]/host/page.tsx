"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TaskReview, AutoScoringInfo } from "@/app/components/TaskReview";
import { QuestionBoard } from "@/app/components/QuestionBoard";
import { AnswerVisibility } from "@/app/components/AnswerVisibility";
import { JeopardyBoard } from "@/app/components/JeopardyBoard";
import { useGameTimer } from "@/lib/useGameTimer";
import { useSocket } from "@/lib/useSocket";

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
  hostId?: string;
}

export default function HostGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState<Record<string, number>>({});
  const [showScoring, setShowScoring] = useState(false);
  const [useJeopardyView, setUseJeopardyView] = useState(true);

  // Initialize Socket.io
  const { connected: socketConnected } = useSocket(gameId, () => {
    fetchState();
  });

  // Get current round and question
  const currentRound = session?.rounds[session?.currentRoundIndex];
  const currentQuestion = currentRound?.questions?.[currentRound?.currentQuestionIndex];

  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : null;
  const playerToken = typeof window !== "undefined" ? localStorage.getItem("playerToken") : null;
  const hostId = typeof window !== "undefined" ? localStorage.getItem("hostId") : null;

  // Debug logging
  useEffect(() => {
    if (session) {
      console.log('[Host Page] Socket Connected:', socketConnected);
    }
  }, [session, socketConnected]);

  // Use the custom timer hook - also for host to control timer
  const { timeLeft, pauseTimer, resumeTimer, addTime } = useGameTimer(
    currentQuestion?.startedAt ? new Date(currentQuestion.startedAt) : null,
    currentQuestion?.timeLimit || 30,
    async () => {
      // Auto-reveal when timer hits 0
      if (!playerId || !playerToken || !gameId || !currentQuestion || currentQuestion?.revealed) return;
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

  async function selectQuestion(questionIndex: number) {
    if (!session || !currentRound || !playerId || !playerToken) return;
    
    setLoading(true);
    try {
      // Fetch the specific question to load it
      const round = session.rounds[session.currentRoundIndex];
      const targetQuestion = round.questions[questionIndex];
      
      if (!targetQuestion) {
        throw new Error("Question not found");
      }

      // Use next-question API to navigate to this specific question
      const res = await fetch(`/api/game/${gameId}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playerId,
          playerToken,
          targetQuestionIndex: questionIndex 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        // Fallback - just fetch the current state
        await fetchState();
      } else {
        setSession(data.session);
        // After successful selection, immediately fetch fresh state
        // to ensure we have latest state from server
        await new Promise(resolve => setTimeout(resolve, 100));
        await fetchState();
      }
      setShowScoring(false);
    } catch (err: any) {
      console.error("Failed to select question:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getRandomQuestion() {
    if (!session || !currentRound || !playerId || !playerToken) return;

    setLoading(true);
    try {
      const round = session.rounds[session.currentRoundIndex];
      const questions = round.questions || [];
      
      // Filter out attempted questions (revealed or has answers)
      const availableQuestions = questions.filter(
        (q: any) => !q.revealed && Object.keys(q.answers || {}).length === 0
      );

      if (availableQuestions.length === 0) {
        setError("No available questions remaining");
        setLoading(false);
        return;
      }

      // Select random question
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const selectedQuestion = availableQuestions[randomIndex];
      const questionIndex = questions.findIndex((q: any) => q.id === selectedQuestion.id);

      // Navigate to the selected question
      const res = await fetch(`/api/game/${gameId}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          playerId,
          playerToken,
          targetQuestionIndex: questionIndex 
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        await fetchState();
      } else {
        setSession(data.session);
        // After successful selection, immediately fetch fresh state
        await new Promise(resolve => setTimeout(resolve, 100));
        await fetchState();
      }
      setShowScoring(false);
    } catch (err: any) {
      console.error("Failed to get random question:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!gameId) return;
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  async function fetchState() {
    try {
      const res = await fetch(`/api/lobby/${gameId}?playerId=${playerId || ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSession(data.session);
      // Host view is now public - anyone with the gameId can view
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function prepareScoring() {
    if (!session) return;
    const map: Record<string, number> = {};
    Object.values(session.players).forEach((p) => {
      map[p.id] = 0;
    });
    setScoring(map);
    setShowScoring(true);
  }

  function handleScoreChange(targetPlayerId: string, value: string) {
    setScoring((prev) => ({
      ...prev,
      [targetPlayerId]: parseInt(value, 10) || 0,
    }));
  }

  async function submitReveal() {
    if (!playerId || !playerToken) return;
    setLoading(true);
    try {
      const results = Object.entries(scoring).map(([pid, pointsEarned]) => ({ playerId: pid, pointsEarned }));
      const res = await fetch(`/api/game/${gameId}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken, results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reveal failed");
      setSession(data.session);
      setShowScoring(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveTaskSubmission(targetPlayerId: string, points: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPlayerId,
          newScore: (session?.players.find(p => p.id === targetPlayerId)?.score || 0) + points,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to approve");
      }

      await fetchState();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function adjustScores() {
    setLoading(true);
    try {
      const requests = Object.entries(scoring)
        .filter(([_, delta]) => delta !== 0)
        .map(([pid, delta]) =>
          fetch(`/api/game/${gameId}/score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetPlayerId: pid, delta }),
          })
        );

      const responses = await Promise.all(requests);
      const failed = responses.filter(r => !r.ok);

      if (failed.length > 0) {
        throw new Error(`${failed.length} score updates failed`);
      }

      await fetchState();
      setShowScoring(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function nextQuestion() {
    if (!playerId || !playerToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Next question failed");
      setSession(data.session);
      setShowScoring(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function completeRound() {
    if (!playerId || !playerToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/complete-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Complete round failed");
      setSession(data.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function nextRound() {
    if (!playerId || !playerToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/next-round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Next round failed");
      setSession(data.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function endGame() {
    if (!playerId || !playerToken) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/game/${gameId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "End game failed");
      setSession(data.session);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-4">Loading...</p>;
  if (!session) return <p className="p-4">No session found</p>;

  const round = currentRound;
  const question = currentQuestion;

  const isTaskQuestion = question?.type === "TASK";

  // Build player answers map for TaskReview (only for TASK questions)
  const playerAnswersMap: Record<string, { playerName: string; submission: any; submitted: boolean }> = {};
  if (isTaskQuestion && question?.answers) {
    const players = Array.isArray(session.players) ? session.players : Object.values(session.players);
    players.forEach((p) => {
      const playerAnswer = question.answers?.find((a: any) => a.playerId === p.id);
      if (playerAnswer) {
        playerAnswersMap[p.id] = {
          playerName: p.name,
          submission: playerAnswer.submission || playerAnswer.answerText || playerAnswer.answer,
          submitted: !!playerAnswer.answer,
        };
      }
    });
  }

  // If using Jeopardy view, show the board with control panel
  if (useJeopardyView) {
    return (
      <div className="relative">
        {/* Jeopardy Board */}
        <div className="fixed inset-0 z-0">
          <JeopardyBoard
            round={currentRound}
            currentQuestionIndex={currentRound?.currentQuestionIndex || 0}
            onSelectQuestion={selectQuestion}
            onRandomQuestion={getRandomQuestion}
            loading={loading}
          />
        </div>

        {/* Control Panel overlaid */}
        <div className="fixed right-0 top-0 w-96 h-screen bg-white/95 backdrop-blur-sm shadow-2xl overflow-y-auto z-10 border-l border-gray-300">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">⚙️ Controls</h2>
              <button
                onClick={() => setUseJeopardyView(false)}
                className="text-xs px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Grid View
              </button>
            </div>
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

            {round && question && (
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600">Current Question</p>
                <p className="font-medium text-sm">
                  Q{currentRound?.currentQuestionIndex + 1}: {question?.text?.substring(0, 40)}
                  {question?.text && question.text.length > 40 ? "..." : ""}
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">⏱️ {timeLeft}s</p>
              </div>
            )}

            {/* Timer Controls - Available during active question */}
            {question && session.checkpoint === "QUESTION_ACTIVE" ? (
              <div className="space-y-2 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs font-semibold text-yellow-800 mb-2">⏱️ Timer Controls</p>
                <button
                  onClick={pauseTimer}
                  className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
                >
                  ⏸️ Pause Timer
                </button>
                <button
                  onClick={resumeTimer}
                  className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                >
                  ▶️ Resume Timer
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addTime(30)}
                    className="px-2 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => addTime(60)}
                    className="px-2 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    +1m
                  </button>
                </div>
              </div>
            ) : null}

            <div className="space-y-2 mb-6">
              <button
                onClick={nextQuestion}
                disabled={loading}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                ➡️ Next Question
              </button>
              <button
                onClick={prepareScoring}
                disabled={loading || !question}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                ✅ Reveal / Score
              </button>
              <button
                onClick={completeRound}
                disabled={loading}
                className="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                ⏁ Complete Round
              </button>
              <button
                onClick={nextRound}
                disabled={loading}
                className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                📊 Next Round
              </button>
              <button
                onClick={endGame}
                disabled={loading}
                className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                ⏹️ End Game
              </button>
            </div>

            {showScoring && isTaskQuestion ? (
              <div className="mb-4 p-3 border rounded bg-gray-50">
                <AutoScoringInfo questionType={question?.type} timeLeft={timeLeft} />
                <TaskReview
                  question={question}
                  playersData={playerAnswersMap}
                  onApprove={(targetPlayerId, points) => approveTaskSubmission(targetPlayerId, points)}
                  loading={loading}
                />
                <button
                  onClick={() => setShowScoring(false)}
                  className="w-full mt-2 px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            ) : showScoring ? (
              <div className="mb-4 p-3 border rounded bg-gray-50">
                <AutoScoringInfo questionType={question?.type} timeLeft={timeLeft} />

                {/* Answer Visibility - Show what players answered */}
                {question && !isTaskQuestion ? (
                  <div className="mb-4 p-2 border rounded bg-blue-50">
                    <h3 className="font-semibold mb-2 text-xs">Player Answers</h3>
                    <AnswerVisibility
                      question={question}
                      answers={Object.entries(question.answers || {}).map(([playerId, answer]) => {
                        const players = Array.isArray(session.players) ? session.players : Object.values(session.players);
                        const player = players.find((p) => p.id === playerId);
                        return {
                          playerId,
                          playerName: player?.name || "Unknown",
                          answer,
                          timeMs: 0,
                          submitted: !!answer,
                        };
                      })}
                    />
                  </div>
                ) : null}

                <h3 className="font-semibold mb-2 text-sm">Scoring</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {(Array.isArray(session.players) ? session.players : Object.values(session.players)).map((p) => (
                    <div key={p.id} className="flex items-center gap-1 text-sm">
                      <span className="flex-1 text-xs">{p.name}</span>
                      <input
                        type="number"
                        value={scoring[p.id] || 0}
                        onChange={(e) => handleScoreChange(p.id, e.target.value)}
                        className="w-14 px-2 py-1 rounded border-gray-300 shadow-sm text-xs"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={submitReveal}
                    className="w-full px-2 py-1 text-xs bg-green-700 text-white rounded hover:bg-green-800"
                  >
                    Submit
                  </button>
                  <button
                    onClick={adjustScores}
                    className="w-full px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
                  >
                    Apply Changes
                  </button>
                  <button
                    onClick={() => setShowScoring(false)}
                    className="w-full px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-2">Players ({(Array.isArray(session.players) ? session.players : Object.values(session.players)).length})</h3>
              <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
                {(Array.isArray(session.players) ? session.players : Object.values(session.players))
                  .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.name.localeCompare(b.name);
                  })
                  .map((p, idx) => (
                    <li key={p.id} className="flex justify-between items-center p-1 hover:bg-gray-100 rounded">
                      <span className="flex-1">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "  "} {p.name}
                      </span>
                      <span className="font-semibold text-indigo-600">{p.score}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original grid question view
  return (
    <div className="relative">
      {/* Full-screen Question Board displayed behind */}
      <div className="fixed inset-0 z-0">
        <QuestionBoard
          question={question}
          players={session.players}
          roundNumber={round?.roundNumber}
          category={round?.category}
          questionNumber={round?.currentQuestionIndex ? round.currentQuestionIndex + 1 : 1}
        />
      </div>

      {/* Control Panel overlaid on the right side */}
      <div className="fixed right-0 top-0 w-96 h-screen bg-white/95 backdrop-blur-sm shadow-2xl overflow-y-auto z-10 border-l border-gray-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">📺 Game Controls</h2>
            <button
              onClick={() => setUseJeopardyView(true)}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Jeopardy
            </button>
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          {round && (
            <div className="mb-4 pb-4 border-b">
              <p className="text-sm text-gray-600">Current Question</p>
              <p className="font-medium">
                Q{round.currentQuestionIndex + 1}: {question?.text?.substring(0, 50)}
                {question?.text && question.text.length > 50 ? "..." : ""}
              </p>
              <p className="text-lg font-bold text-blue-600 mt-2">⏱️ {timeLeft}s</p>
            </div>
          )}

          {/* Timer Controls - Available during active question */}
          {question && session.checkpoint === "QUESTION_ACTIVE" ? (
            <div className="space-y-2 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs font-semibold text-yellow-800 mb-2">⏱️ Timer Controls</p>
              <button
                onClick={pauseTimer}
                className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 font-medium"
              >
                ⏸️ Pause Timer
              </button>
              <button
                onClick={resumeTimer}
                className="w-full px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 font-medium"
              >
                ▶️ Resume Timer
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addTime(30)}
                  className="px-2 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  +30s
                </button>
                <button
                  onClick={() => addTime(60)}
                  className="px-2 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  +1m
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2 mb-6">
            <button
              onClick={nextQuestion}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              ➡️ Next Question
            </button>
            <button
              onClick={prepareScoring}
              disabled={loading || !question}
              className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              ✅ Reveal / Score
            </button>
            <button
              onClick={completeRound}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              ⏁ Complete Round
            </button>
            <button
              onClick={nextRound}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              📊 Next Round
            </button>
            <button
              onClick={endGame}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              ⏹️ End Game
            </button>
          </div>

          {showScoring && isTaskQuestion ? (
            <div className="mb-4 p-3 border rounded bg-gray-50">
              <AutoScoringInfo questionType={question?.type} timeLeft={timeLeft} />
              <TaskReview
                question={question}
                playersData={playerAnswersMap}
                onApprove={(targetPlayerId, points) => approveTaskSubmission(targetPlayerId, points)}
                loading={loading}
              />
              <button
                onClick={() => setShowScoring(false)}
                className="w-full mt-2 px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          ) : showScoring ? (
            <div className="mb-4 p-3 border rounded bg-gray-50">
              <AutoScoringInfo questionType={question?.type} timeLeft={timeLeft} />

              {/* Answer Visibility - Show what players answered */}
              {question && !isTaskQuestion ? (
                <div className="mb-4 p-2 border rounded bg-blue-50">
                  <h3 className="font-semibold mb-2 text-xs">Player Answers</h3>
                  <AnswerVisibility
                    question={question}
                    answers={Object.entries(question.answers || {}).map(([playerId, answer]) => {
                      const player = session.players.find((p) => p.id === playerId);
                      return {
                        playerId,
                        playerName: player?.name || "Unknown",
                        answer,
                        timeMs: 0,
                        submitted: !!answer,
                      };
                    })}
                  />
                </div>
              ) : null}

              <h3 className="font-semibold mb-2 text-sm">Scoring</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {session.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-1 text-sm">
                    <span className="flex-1">{p.name}</span>
                    <input
                      type="number"
                      value={scoring[p.id] || 0}
                      onChange={(e) => handleScoreChange(p.id, e.target.value)}
                      className="w-16 px-2 py-1 rounded border-gray-300 shadow-sm text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 space-y-1">
                <button
                  onClick={submitReveal}
                  className="w-full px-2 py-1 text-xs bg-green-700 text-white rounded hover:bg-green-800"
                >
                  Submit
                </button>
                <button
                  onClick={adjustScores}
                  className="w-full px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800"
                >
                  Apply Changes
                </button>
                <button
                  onClick={() => setShowScoring(false)}
                  className="w-full px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div className="border-t pt-4">
            <h3 className="font-semibold text-sm mb-2">Players ({Object.keys(session.players).length})</h3>
            <ul className="space-y-1 text-sm max-h-96 overflow-y-auto">
              {Object.values(session.players)
                .sort((a, b) => {
                  if (b.score !== a.score) return b.score - a.score;
                  return a.name.localeCompare(b.name);
                })
                .map((p, idx) => (
                  <li key={p.id} className="flex justify-between items-center p-1 hover:bg-gray-100 rounded">
                    <span className="flex-1">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "  "} {p.name}
                    </span>
                    <span className="font-semibold text-indigo-600">{p.score}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
