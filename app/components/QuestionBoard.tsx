"use client";

import { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  score: number;
}

interface Question {
  type: string;
  text: string;
  startedAt: string;
  timeLimit: number;
}

interface QuestionBoardProps {
  question: Question | null;
  players: Player[] | Record<string, Player>;
  roundNumber?: number;
  category?: string;
  questionNumber?: number;
}

export function QuestionBoard({
  question,
  players,
  roundNumber = 1,
  category = "Unknown",
  questionNumber = 1,
}: QuestionBoardProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!question?.startedAt) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor(
        (new Date().getTime() - new Date(question.startedAt).getTime()) / 1000
      );
      const remaining = Math.max(0, question.timeLimit - elapsed);
      setTimeLeft(remaining);

      // Color coding: critical (red) at 5s or less, warning (yellow) at 10s or less
      setIsCritical(remaining <= 5);
      setIsWarning(remaining <= 10 && remaining > 5);
    }, 100);

    return () => clearInterval(timer);
  }, [question?.startedAt, question?.timeLimit]);

  if (!question) {
    return (
      <div className="w-full h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Quiz Board</h1>
          <p className="text-xl text-[var(--muted)]">Waiting for next question...</p>
        </div>
      </div>
    );
  }

  const playerList = Array.isArray(players) ? players : Object.values(players || {});
  const sortedPlayers = [...playerList].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full min-h-screen bg-[var(--background)] p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold">
              Round {roundNumber} • {category} • Q{questionNumber}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--muted)] mb-1">Question Type</div>
            <div className="bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-lg text-xl font-semibold">
              {question.type}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <div className="mb-8 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 shadow-sm min-h-64 flex flex-col justify-center">
        <div>
          <p className="text-6xl font-bold leading-tight">{question.text}</p>
        </div>
      </div>

      {/* Timer Section */}
      <div className="mb-8 flex justify-center">
        <div
          className={`relative w-64 h-64 rounded-full flex items-center justify-center font-bold text-6xl transition-all duration-300 shadow-2xl ${
            isCritical
              ? "bg-[var(--danger)] text-white scale-110 animate-pulse"
              : isWarning
                ? "bg-[var(--warning)] text-white scale-105"
                : "bg-[var(--accent)] text-white"
          }`}
        >
          <div className="text-center">
            <div className="text-7xl font-black">{timeLeft}s</div>
            <div className="text-lg text-white/80 mt-2">
              {isCritical ? "⚠️ HURRY!" : isWarning ? "⏱️ TIME!" : "⏳ GO!"}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {sortedPlayers.map((player, idx) => {
          const medals = ["🥇", "🥈", "🥉"];
          const medal = medals[idx] || `#${idx + 1}`;

          return (
            <div
              key={player.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:border-[var(--accent)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{medal}</div>
                <div className="text-sm text-[var(--muted)] uppercase tracking-wider">
                  Position {idx + 1}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 truncate">{player.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[var(--accent-pop)]">
                  {player.score}
                </span>
                <span className="text-[var(--muted)]">points</span>
              </div>

              {/* Score bar */}
              <div className="mt-4 h-3 bg-[var(--surface-muted)] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[var(--accent-pop)] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((player.score / (sortedPlayers[0]?.score || 100)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Players Answered Indicator */}
      <div className="mt-12 text-center">
        <div className="inline-block bg-[var(--surface)] border border-[var(--border)] rounded-lg px-8 py-4">
          <div className="text-sm text-[var(--muted)] mb-2">Players Status</div>
          <div className="text-2xl font-bold">
            <span className="text-[var(--success)]">● </span>
            Awaiting Answers...
          </div>
        </div>
      </div>
    </div>
  );
}
