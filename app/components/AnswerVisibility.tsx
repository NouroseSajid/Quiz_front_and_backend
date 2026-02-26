"use client";

import { useState } from "react";

interface AnswerRecord {
  playerId: string;
  playerName: string;
  answer: any;
  timeMs: number;
  submitted: boolean;
}

interface AnswerVisibilityProps {
  question: any;
  answers: AnswerRecord[];
}

export function AnswerVisibility({ question, answers }: AnswerVisibilityProps) {
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  const getAnswerDisplay = (answer: any, questionType: string) => {
    if (answer === null || answer === undefined) return "—";
    
    if (questionType === "MULTIPLE_CHOICE") {
      const options = question.metadata?.options || [];
      const idx = Number(answer);
      return `${String.fromCharCode(65 + idx)}. ${options[idx] || "Unknown"}`;
    }
    if (questionType === "RANGE") {
      return `${(Number(answer) || 0).toLocaleString()}`;
    }
    if (questionType === "GEO") {
      return `${answer.lat?.toFixed(4)}, ${answer.lng?.toFixed(4)}`;
    }
    if (questionType === "TEXT_EXACT" || questionType === "TEXT_CLOSE") {
      return String(answer).substring(0, 50);
    }
    if (questionType === "RANKING") {
      return Array.isArray(answer) ? answer.slice(0, 3).join(" → ") + (answer.length > 3 ? "..." : "") : "—";
    }
    if (questionType === "TASK") {
      if (typeof answer === "object" && answer.taskType) {
        const icons: Record<string, string> = { photo: "📸", text: "📝", physical: "✅" };
        return `${icons[answer.taskType] || "📋"} Submitted`;
      }
      return "Task submitted";
    }
    return "⚙️ Complex answer";
  };

  const submitted = answers.filter((a) => a.submitted);
  const notSubmitted = answers.filter((a) => !a.submitted);

  // Sort by submission time (fastest first)
  const sorted = [...submitted].sort((a, b) => a.timeMs - b.timeMs);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 text-xs bg-[var(--surface)] border border-[var(--border)] p-2 rounded">
        <div className="text-center">
          <span className="font-bold text-[var(--success)]">{submitted.length}</span>
          <br />
          Submitted
        </div>
        <div className="text-center">
          <span className="font-bold text-[var(--danger)]">{notSubmitted.length}</span>
          <br />
          No answer
        </div>
        <div className="text-center">
          <span className="font-bold text-[var(--accent)]">{Math.round(submitted.reduce((sum, a) => sum + a.timeMs, 0) / Math.max(1, submitted.length) / 1000)}s</span>
          <br />
          Avg time
        </div>
      </div>

      {/* Submitted Answers */}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {sorted.map((answer, idx) => (
          <div key={answer.playerId}>
            <button
              onClick={() => setExpandedPlayer(expandedPlayer === answer.playerId ? null : answer.playerId)}
              className="w-full text-left p-2 hover:bg-[var(--surface-muted)] rounded border border-[var(--border)] transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs text-gray-500 min-w-5">#{idx + 1}</span>
                  <span className="font-semibold text-sm">{answer.playerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{(answer.timeMs / 1000).toFixed(1)}s</span>
                  <span className="text-sm">{getAnswerDisplay(answer.answer, question.type)}</span>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedPlayer === answer.playerId && (
              <div className="bg-[var(--surface-muted)] border-l-2 border-[var(--accent)] p-3 text-xs text-[var(--foreground)] ml-1 rounded">
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-gray-600">Full Answer:</span>
                    <div className="mt-1 p-2 bg-[var(--surface)] rounded border border-[var(--border)] font-mono break-words text-xs">
                      {JSON.stringify(answer.answer, null, 2)}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Submission Time:</span>
                    <span className="ml-2">{(answer.timeMs / 1000).toFixed(2)}s elapsed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Not Submitted */}
      {notSubmitted.length > 0 && (
        <div className="bg-[var(--surface)] border-l-4 border-[var(--warning)] p-3 rounded">
          <p className="font-semibold text-sm text-yellow-900 mb-2">
            {notSubmitted.length} {notSubmitted.length === 1 ? "player hasn't" : "players haven't"} answered
          </p>
          <div className="flex flex-wrap gap-1">
            {notSubmitted.map((p) => (
              <span
                key={p.playerId}
                className="inline-block px-2 py-1 bg-[var(--surface-muted)] text-[var(--warning)] rounded text-xs border border-[var(--border)]"
              >
                {p.playerName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
