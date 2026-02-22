"use client";

import { useState } from "react";
import Link from "next/link";
import QuestionForm from "./components/QuestionForm";
import QuestionsList from "./components/QuestionsList";
import type { QuestionInput } from "@/lib/types";

type Tab = "create" | "manage";

export default function AdminInputPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("create");
  const [refreshKey, setRefreshKey] = useState(0);

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

      // Trigger refresh of questions list
      setRefreshKey((prev) => prev + 1);
      // Switch to manage tab to see new question
      setTimeout(() => setActiveTab("manage"), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              🎮 Admin Panel
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Create and manage quiz questions
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
          >
            ← Admin Hub
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-4 border-b border-zinc-300 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeTab === "create"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            ✏️ Create Question
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeTab === "manage"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            📋 Manage Questions
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          {activeTab === "create" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Create a New Question
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Fill out the form below to add a question to your quiz library.
                </p>
              </div>
              <QuestionForm
                onSubmit={handleQuestionSubmit}
                isLoading={isLoading}
              />
            </>
          )}

          {activeTab === "manage" && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  Manage Questions
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  View, edit, and delete your created questions.
                </p>
              </div>
              <QuestionsList key={refreshKey} />
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            💡 Quick Guide
          </h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>
              <strong>Question Type:</strong> Choose from 10 different question formats. Each type has unique scoring logic.
            </li>
            <li>
              <strong>Difficulty:</strong> Numeric level from 1-455 (like Jeopardy). Used for round randomization.
            </li>
            <li>
              <strong>Category:</strong> Precision, Knowledge, Chaos, or Social. Determines which round the question appears in.
            </li>
            <li>
              <strong>Time Limit:</strong> How many seconds players have to answer (5-120 seconds).
            </li>
            <li>
              <strong>Max Points:</strong> Base points for a correct answer (before accuracy &amp; time multipliers).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
