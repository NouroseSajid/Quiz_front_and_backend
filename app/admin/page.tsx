"use client";

import { useState } from "react";
import Link from "next/link";
import QuestionForm from "./input/components/QuestionForm";
import QuestionsList from "./input/components/QuestionsList";
import type { QuestionInput } from "@/lib/types";

type AdminTab = "create" | "manage" | "games";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("create");
  const [isLoading, setIsLoading] = useState(false);

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
            🎯 Active Games
          </button>

          <Link
            href="/"
            className="px-4 py-2 rounded-lg font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            ← Back to Home
          </Link>
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
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
                Active Games
              </h2>
              <div className="text-center py-12">
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  No active games yet.
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Games will appear here once players start playing.
                </p>
              </div>
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
