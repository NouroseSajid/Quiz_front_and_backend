"use client";

import { useState } from "react";

interface QuestionState {
  id: string;
  roundNumber: number;
  questionIndex: number;
  text: string;
  type: string;
  timeLimit: number;
  pointsMax: number;
  startedAt: Date;
  endedAt?: Date;
  revealed: boolean;
  answers: Record<string, any>;
  metadata?: Record<string, any>;
}

interface RoundState {
  id: string;
  roundNumber: number;
  category: string;
  status: "ACTIVE" | "COMPLETE";
  questions: QuestionState[];
  currentQuestionIndex: number;
}

interface JeopardyBoardProps {
  round: RoundState | undefined;
  currentQuestionIndex: number;
  onSelectQuestion: (questionIndex: number) => void;
  onRandomQuestion: () => void;
  loading: boolean;
}

export function JeopardyBoard({
  round,
  currentQuestionIndex,
  onSelectQuestion,
  onRandomQuestion,
  loading,
}: JeopardyBoardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  
  if (!round) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-white text-xl">No questions available</p>
      </div>
    );
  }

  const questions = round.questions || [];
  
  // Group questions by points (assuming difficulty = points)
  const pointValues = [...new Set(questions.map(q => q.pointsMax))].sort((a, b) => a - b);
  
  // Determine grid layout: use classic Jeopardy if multiple point values, otherwise use flexible grid
  const isClassicJeopardyLayout = pointValues.length > 1;
  const gridColumns = isClassicJeopardyLayout ? pointValues.length : 6; // 6 columns for flexible layout
  
  // Check if a question has been attempted (revealed or has answers)
  const isQuestionAttempted = (question: QuestionState) => question.revealed || Object.keys(question.answers || {}).length > 0;

  const handleSelectQuestion = (questionIndex: number) => {
    if (loading) return;
    onSelectQuestion(questionIndex);
    setShowSettings(false);
  };

  const handleToggleQuestionSelection = (questionIndex: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionIndex)) {
      newSelected.delete(questionIndex);
    } else {
      newSelected.add(questionIndex);
    }
    setSelectedQuestions(newSelected);
  };

  const handleRandomFromSelected = () => {
    if (selectedQuestions.size === 0) return;
    const selectedArray = Array.from(selectedQuestions);
    const randomIndex = selectedArray[Math.floor(Math.random() * selectedArray.length)];
    handleSelectQuestion(randomIndex);
  };

  return (
      <div className="w-full min-h-screen bg-[var(--background)] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          {round.category} - Round {round.roundNumber}
        </h1>
        <p className="text-[var(--muted)] text-center text-sm">
          {questions.length} Questions • {questions.filter(q => !isQuestionAttempted(q)).length} Remaining
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        <button
          onClick={onRandomQuestion}
          disabled={loading || questions.filter(q => !isQuestionAttempted(q)).length === 0}
          className="px-6 py-2 bg-[var(--accent-pop)] hover:opacity-90 disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:cursor-not-allowed text-white font-bold rounded-lg transition shadow-sm"
        >
          🎲 Random Question
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-6 py-2 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white font-bold rounded-lg transition shadow-sm"
        >
          ⚙️ {showSettings ? "Hide" : "Show"} Settings
        </button>
      </div>

      {/* Selection Panel when settings open */}
      {showSettings && (
        <div className="mb-8 p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <h2 className="font-bold mb-4 text-lg">Preselect questions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4 max-h-64 overflow-y-auto">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => handleToggleQuestionSelection(idx)}
                className={`p-2 rounded font-semibold text-sm transition border border-[var(--border)] ${
                  selectedQuestions.has(idx)
                    ? "bg-[var(--accent)] text-white"
                    : isQuestionAttempted(q)
                    ? "bg-[var(--surface-muted)] text-[var(--muted)]"
                    : "bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)]"
                } ${isQuestionAttempted(q) ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={isQuestionAttempted(q)}
              >
                Q{idx + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRandomFromSelected}
              disabled={selectedQuestions.size === 0}
              className="flex-1 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:cursor-not-allowed text-white font-bold rounded transition"
            >
              ✨ Random from Selected ({selectedQuestions.size})
            </button>
            <button
              onClick={() => {
                setSelectedQuestions(new Set());
                setShowSettings(false);
              }}
              className="px-4 py-2 bg-[var(--surface-muted)] hover:bg-[var(--surface)] text-[var(--foreground)] font-bold rounded transition border border-[var(--border)]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Jeopardy Grid */}
      <div className="max-w-6xl mx-auto">
        {isClassicJeopardyLayout ? (
          // Classic Jeopardy layout with point values and categories
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${pointValues.length}, 1fr)` }}>
            {/* Header Row - Point Values */}
            {pointValues.map((points) => (
              <div
                key={`header-${points}`}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 text-center"
              >
                <p className="font-bold text-2xl text-[var(--accent)]">${points}</p>
              </div>
            ))}

            {/* Question Cards */}
            {questions.map((question, idx) => {
              const isAttempted = isQuestionAttempted(question);
              const isCurrent = idx === currentQuestionIndex && currentQuestionIndex !== -1;

              return (
                <button
                  key={question.id}
                  onClick={() => handleSelectQuestion(idx)}
                  disabled={loading || isAttempted}
                  className={`
                    p-6 rounded-lg font-bold text-2xl transition transform border
                    ${isCurrent
                      ? "scale-105 ring-2 ring-[var(--accent-pop)] shadow-sm"
                      : "hover:scale-105"
                    }
                    ${isAttempted
                      ? "bg-[var(--surface-muted)] text-[var(--muted)] border-[var(--border)] cursor-not-allowed opacity-70"
                      : isCurrent
                      ? "bg-[var(--accent-pop)] text-white border-[var(--accent-pop)]"
                      : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]"
                    }
                  `}
                  title={isAttempted ? "Question already answered" : question.text}
                >
                  {isAttempted ? "✓" : "?"}
                </button>
              );
            })}
          </div>
        ) : (
          // Flexible grid layout when all questions have same point value
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
            {questions.map((question, idx) => {
              const isAttempted = isQuestionAttempted(question);
              const isCurrent = idx === currentQuestionIndex && currentQuestionIndex !== -1;

              return (
                <button
                  key={question.id}
                  onClick={() => handleSelectQuestion(idx)}
                  disabled={loading || isAttempted}
                  className={`
                    p-4 rounded-lg font-bold text-lg transition transform border
                    ${isCurrent
                      ? "scale-105 ring-2 ring-[var(--accent-pop)] shadow-sm"
                      : "hover:scale-105"
                    }
                    ${isAttempted
                      ? "bg-[var(--surface-muted)] text-[var(--muted)] border-[var(--border)] cursor-not-allowed opacity-70"
                      : isCurrent
                      ? "bg-[var(--accent-pop)] text-white border-[var(--accent-pop)]"
                      : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--accent)]"
                    }
                  `}
                  title={isAttempted ? "Question already answered" : question.text}
                >
                  {isAttempted ? "✓" : idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="max-w-6xl mx-auto mt-8 text-[var(--muted)] text-center text-sm">
        <p>
          Total: {questions.length} | Answered: {questions.filter(isQuestionAttempted).length} |{" "}
          Remaining: {questions.filter(q => !isQuestionAttempted(q)).length}
        </p>
      </div>
    </div>
  );
}
