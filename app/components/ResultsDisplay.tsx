"use client";

import { useState, useEffect } from "react";

interface PlayerResult {
  id: string;
  name: string;
  answer: any;
  correct: boolean;
  pointsEarned: number;
  timeMs: number;
}

interface ResultsDisplayProps {
  question: any;
  players: Array<{ id: string; name: string }>;
  results: Array<PlayerResult>;
  isHost?: boolean;
}

export function ResultsDisplay({
  question,
  players,
  results,
  isHost = false,
}: ResultsDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Sort by points earned (descending), then by name
  const sortedResults = [...results].sort((a, b) => {
    if (b.pointsEarned !== a.pointsEarned) return b.pointsEarned - a.pointsEarned;
    return a.name.localeCompare(b.name);
  });
  const correctCount = results.filter((r) => r.correct).length;
  const correctPercentage = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  const getOptionText = (value: any) => {
    const options = (question.metadata?.options || []).map((opt: any) =>
      typeof opt === "string" ? { text: opt } : opt
    );

    if (typeof value === "number") {
      return options[value]?.text || `Option ${value}`;
    }

    if (typeof value === "string") {
      return value;
    }

    return "Unknown";
  };

  const getAnswerDisplay = (answer: any, questionType: string) => {
    if (answer === null || answer === undefined) return "No answer";

    if (questionType === "MULTIPLE_CHOICE") {
      return getOptionText(answer);
    }
    if (questionType === "RANGE") {
      return String(answer);
    }
    if (questionType === "GEO") {
      return `${answer.lat?.toFixed(2)}, ${answer.lng?.toFixed(2)}`;
    }
    if (questionType === "TEXT_EXACT") {
      return String(answer);
    }
    if (questionType === "RANKING") {
      return Array.isArray(answer) ? answer.join(" → ") : "Invalid ranking";
    }
    if (questionType === "TASK") {
      return "Task submitted (host reviewed)";
    }
    return JSON.stringify(answer);
  };

  const getCorrectAnswerDisplay = (correct: any, questionType: string) => {
    if (correct === null || correct === undefined) return "N/A";

    if (questionType === "MULTIPLE_CHOICE") {
      return getOptionText(correct);
    }
    if (questionType === "RANGE") {
      return String(correct);
    }
    if (questionType === "GEO") {
      return `${correct.lat?.toFixed(2)}, ${correct.lng?.toFixed(2)}`;
    }
    return JSON.stringify(correct);
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--success)]">{correctCount}</div>
          <div className="text-xs text-gray-600">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--danger)]">{results.length - correctCount}</div>
          <div className="text-xs text-gray-600">Wrong</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--accent)]">{correctPercentage}%</div>
          <div className="text-xs text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Correct Answer Display */}
      {!question.metadata?.taskType && (
        <div className="bg-[var(--surface)] border border-[var(--success)] p-4 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
          <p className="text-lg font-bold text-[var(--success)]">
            {getCorrectAnswerDisplay(question.correct, question.type)}
          </p>
        </div>
      )}

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full px-4 py-2 bg-[var(--surface-muted)] text-[var(--accent-strong)] rounded-lg hover:bg-[var(--surface)] font-medium text-sm border border-[var(--border)]"
      >
        {showDetails ? "Hide Player Results" : "Show Player Results"}
      </button>

      {/* Player Results */}
      {showDetails && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedResults.map((result, idx) => (
            <div
              key={result.id}
              className={`p-3 rounded-lg border ${
                result.correct
                  ? "bg-[var(--surface)] border-[var(--success)]"
                  : "bg-[var(--surface)] border-[var(--danger)]"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-700">#{idx + 1}</span>
                  <span className="font-semibold">{result.name}</span>
                  {result.correct && <span className="text-green-600">✓</span>}
                </div>
                <span className="text-lg font-bold text-blue-600">+{result.pointsEarned}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-500">Their answer:</span>
                  <p className="font-mono text-gray-700">{getAnswerDisplay(result.answer, question.type)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Answered in:</span>
                  <p className="font-mono text-gray-700">{(result.timeMs / 1000).toFixed(1)}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Message */}
      <div className="text-center text-sm text-[var(--muted)] bg-[var(--surface)] border border-[var(--border)] p-3 rounded">
        {correctPercentage === 100 ? (
          <p>🎉 Everyone got it right!</p>
        ) : correctPercentage >= 50 ? (
          <p>Good attempt! {correctPercentage}% of players were correct.</p>
        ) : correctPercentage === 0 ? (
          <p>Tough question! No one got it right.</p>
        ) : (
          <p>Challenge question! Only {correctPercentage}% were correct.</p>
        )}
      </div>
    </div>
  );
}
