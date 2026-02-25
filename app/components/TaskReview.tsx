"use client";

import { useState } from "react";

interface TaskReviewProps {
  question: any;
  playersData: Record<string, any>;
  onApprove: (playerId: string, pointsAwarded: number) => Promise<void>;
  loading?: boolean;
}

export function TaskReview({
  question,
  playersData,
  onApprove,
  loading = false,
}: TaskReviewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [points, setPoints] = useState(1000);
  const [feedback, setFeedback] = useState("");

  const handleApprove = async () => {
    if (!selectedPlayer) return;
    await onApprove(selectedPlayer, points);
    setSelectedPlayer(null);
    setPoints(1000);
    setFeedback("");
  };

  const submittedPlayers = Object.entries(playersData).filter(([_, data]: any) => data?.submitted);

  return (
    <div className="space-y-4 bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Task Review: {question?.text}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {submittedPlayers.length} of {Object.keys(playersData).length} players submitted
          </p>
        </div>
        <span className="text-3xl">📋</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {submittedPlayers.map(([playerId, data]: [string, any]) => (
          <button
            key={playerId}
            onClick={() => setSelectedPlayer(playerId)}
            className={`p-3 rounded-lg text-left border-2 transition-all ${
              selectedPlayer === playerId
                ? "border-purple-600 bg-purple-100 shadow-lg"
                : "border-gray-300 bg-white hover:border-purple-400"
            }`}
          >
            <div className="font-semibold text-gray-900">{data.playerName}</div>
            <div className="text-xs text-gray-600 mt-1">
              {question?.metadata?.taskType === "photo" && "📸 Photo submitted"}
              {question?.metadata?.taskType === "text" && "📝 Response submitted"}
              {question?.metadata?.taskType === "physical" && "✅ Task completed"}
            </div>
            {data.submission && (
              <div className="text-xs text-gray-700 mt-2 line-clamp-2">
                {typeof data.submission === "string" && data.submission}
                {data.submission?.completed && "Completed: Yes"}
              </div>
            )}
          </button>
        ))}
      </div>

      {selectedPlayer && (
        <div className="bg-white rounded-lg p-4 space-y-4 border-2 border-purple-300">
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Player Submission</h4>
            <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
              {playersData[selectedPlayer]?.submission || "No details available"}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points to Award
              </label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                min="0"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="text-xs text-gray-500 mt-1">0-1000 points</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Great creativity! / Needs more effort / etc"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? "Approving..." : "✓ Approve & Award"}
            </button>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 bg-white p-2 rounded italic">
        💡 Tip: Award points based on creativity, effort, and completion quality
      </div>
    </div>
  );
}

export function AutoScoringInfo({
  questionType,
  timeLeft,
}: {
  questionType: string;
  timeLeft?: number;
}) {
  if (!["MULTIPLE_CHOICE", "RANGE", "GEO", "TEXT_EXACT", "RANKING"].includes(questionType)) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
      <div className="flex gap-2">
        <span className="text-xl">⚡</span>
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Auto-Scoring Active</p>
          <p className="text-blue-800">
            Points are being calculated automatically using the WASM scoring engine.
          </p>
          {timeLeft && <p className="text-xs text-blue-700 mt-1">Time remaining: {timeLeft}s</p>}
        </div>
      </div>
    </div>
  );
}
