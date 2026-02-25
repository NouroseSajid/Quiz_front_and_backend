"use client";

import { useEffect, useState } from "react";
import type { Question, Round } from "@prisma/client";

interface QuestionWithRound extends Question {
  round: Round;
}

export default function QuestionsList() {
  const [questions, setQuestions] = useState<QuestionWithRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTimeLimit, setEditTimeLimit] = useState(30);
  const [editPointsMax, setEditPointsMax] = useState(1000);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEdit = (question: QuestionWithRound) => {
    setEditingId(question.id);
    setEditText(question.text);
    setEditTimeLimit(question.timeLimit);
    setEditPointsMax(question.pointsMax);
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          text: editText,
          timeLimit: editTimeLimit,
          pointsMax: editPointsMax,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      await fetchQuestions();
      setEditingId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      await fetchQuestions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-900 dark:text-red-100">Error: {error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          No questions created yet. Create your first question to get started!
        </p>
      </div>
    );
  }

  // Group questions by category and type
  const grouped = questions.reduce(
    (acc, q) => {
      const key = `${q.round.category}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(q);
      return acc;
    },
    {} as Record<string, QuestionWithRound[]>
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryQuestions]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            {category} Round ({categoryQuestions.length} questions)
          </h3>

          <div className="space-y-3">
            {categoryQuestions.map((question, idx) => (
              <div
                key={question.id}
                className="p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950"
              >
                {editingId === question.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Time Limit (seconds)
                        </label>
                        <input
                          type="number"
                          value={editTimeLimit}
                          onChange={(e) => setEditTimeLimit(parseInt(e.target.value))}
                          className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Max Points
                        </label>
                        <input
                          type="number"
                          value={editPointsMax}
                          onChange={(e) => setEditPointsMax(parseInt(e.target.value))}
                          className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1 text-sm bg-zinc-500 hover:bg-zinc-600 text-white rounded transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(question.id)}
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {idx + 1}. {question.text}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                          {question.type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded">
                          {question.timeLimit}s
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 rounded">
                          {question.pointsMax} pts
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Total questions:</strong> {questions.length} across{" "}
          {Object.keys(grouped).length} categories
        </p>
      </div>
    </div>
  );
}
