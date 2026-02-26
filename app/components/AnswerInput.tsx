"use client";

import { useState } from "react";

interface AnswerInputProps {
  questionType: string;
  questionText: string;
  metadata: any;
  onSubmit: (answer: any) => Promise<void>;
  timeLeft?: number;
  gameId?: string;
  playerId?: string;
  playerToken?: string;
}

export function AnswerInput({
  questionType,
  questionText,
  metadata,
  onSubmit,
  timeLeft,
  gameId,
  playerId,
  playerToken,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer === null || answer === "") {
      setError("Please provide an answer");
      return;
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      // For TASK with file upload, handle FormData submission
      if (questionType === "TASK" && answer.file) {
        const formData = new FormData();
        formData.append("playerId", playerId || "");
        formData.append("playerToken", playerToken || "");
        formData.append("answer", JSON.stringify({
          taskType: metadata?.taskType,
          completed: answer.completed,
          proof: answer.proof,
          text: answer.text,
        }));
        formData.append("file", answer.file);

        // Simulate progress for better UX
        setUploadProgress(30);
        
        const response = await fetch(`/api/game/${gameId}/answer`, {
          method: "POST",
          body: formData,
        });

        setUploadProgress(70);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to submit answer");
        }

        setUploadProgress(100);
        await onSubmit(answer);
      } else {
        // Regular JSON submission
        await onSubmit(answer);
      }

      setAnswer(null);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || "Failed to submit answer");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold flex-1">{questionText}</h3>
        {timeLeft !== undefined && (
          <span
            className={`text-sm font-bold px-3 py-1 rounded ${
              timeLeft > 10
                ? "bg-[var(--surface-muted)] text-[var(--success)] border border-[var(--success)]"
                : timeLeft > 5
                  ? "bg-[var(--surface-muted)] text-[var(--warning)] border border-[var(--warning)]"
                  : "bg-[var(--surface-muted)] text-[var(--danger)] border border-[var(--danger)]"
            }`}
          >
            {timeLeft}s
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {questionType === "MULTIPLE_CHOICE" && (
          <MCQInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {questionType === "RANGE" && (
          <RangeInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {questionType === "GEO" && (
          <GeoInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {questionType === "TEXT_EXACT" && (
          <TextInput value={answer} onChange={setAnswer} />
        )}

        {questionType === "TEXT_CLOSE" && (
          <TextInput value={answer} onChange={setAnswer} />
        )}

        {questionType === "RANKING" && (
          <RankingInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {questionType === "CONSENSUS" && (
          <ConsensusInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {questionType === "HIDDEN_REVEAL" && (
          <HiddenRevealInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {questionType === "BUZZER" && (
          <BuzzerInput value={answer} onChange={setAnswer} />
        )}

        {questionType === "TASK" && (
          <TaskInput metadata={metadata} value={answer} onChange={setAnswer} />
        )}

        {error && <p className="text-[var(--danger)] text-sm">{error}</p>}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || answer === null || answer === ""}
          className="w-full px-4 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-strong)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--muted)] disabled:cursor-not-allowed font-medium"
        >
          {loading ? `Submitting${uploadProgress > 0 ? ` (${uploadProgress}%)` : "..."}` : "Submit Answer"}
        </button>
      </form>
    </div>
  );
}

function MCQInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const options = metadata?.options || [];
  const displayMode = metadata?.displayMode || "text"; // "text", "image", or "mixed"

  // Check if any option has an image
  const hasImages = options.some((opt: any) => 
    typeof opt === "object" && opt.image
  );

  // Normalize options to objects
  const normalizedOptions = options.map((opt: any, idx: number) => {
    if (typeof opt === "string") {
      return { text: opt, image: null };
    }
    return opt;
  });

  const effectiveDisplayMode = hasImages ? (displayMode || "mixed") : "text";

  if (effectiveDisplayMode === "image") {
    // Image-only mode (picture MCQ)
    return (
      <div className="grid grid-cols-2 gap-3">
        {normalizedOptions.map((option: any, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(idx)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              value === idx
                ? "border-blue-600 bg-blue-50 scale-105"
                : "border-gray-300 bg-white hover:border-blue-400"
            }`}
          >
            {option.image && (
              <img
                src={option.image}
                alt={`Option ${String.fromCharCode(65 + idx)}`}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <span className="text-xs font-semibold">
              {String.fromCharCode(65 + idx)}
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (effectiveDisplayMode === "mixed") {
    // Mixed mode (image + text)
    return (
      <div className="space-y-3">
        {normalizedOptions.map((option: any, idx: number) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(idx)}
            className={`flex items-center gap-4 w-full p-4 rounded-lg border-2 text-left transition-all ${
              value === idx
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400"
            }`}
          >
            <span
              className={`text-xl font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                value === idx ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            {option.image && (
              <img
                src={option.image}
                alt={`Option ${String.fromCharCode(65 + idx)}`}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <span className="flex-1 font-medium">{option.text}</span>
          </button>
        ))}
      </div>
    );
  }

  // Text-only mode (default)
  return (
    <div className="space-y-2">
      {normalizedOptions.map((option: any, idx: number) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange(idx)}
          className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all ${
            value === idx
              ? "border-blue-600 bg-blue-50 text-blue-900 scale-102"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
          }`}
        >
          <span className="font-bold text-lg">
            {String.fromCharCode(65 + idx)}.
          </span>{" "}
          <span>{option.text}</span>
        </button>
      ))}
    </div>
  );
}

function RangeInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const { min, max, tolerance } = metadata || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Enter your answer (within ±{tolerance} of the correct value)
        </label>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          placeholder={`Between ${min} and ${max}`}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        Range: {min} to {max}
      </div>
    </div>
  );
}

function GeoInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const { scope } = metadata || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700">Latitude</label>
        <input
          type="number"
          step="0.0001"
          value={value?.lat || ""}
          onChange={(e) =>
            onChange({ ...value, lat: parseFloat(e.target.value) })
          }
          placeholder="-90 to 90"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Longitude</label>
        <input
          type="number"
          step="0.0001"
          value={value?.lng || ""}
          onChange={(e) =>
            onChange({ ...value, lng: parseFloat(e.target.value) })
          }
          placeholder="-180 to 180"
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        Scope: {scope} | Use GPS coordinates or estimate
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your answer"
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  );
}

function RankingInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const items = metadata?.items || [];
  const [ranked, setRanked] = useState<string[]>(value || items);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const newRanked = [...ranked];
    [newRanked[idx - 1], newRanked[idx]] = [newRanked[idx], newRanked[idx - 1]];
    setRanked(newRanked);
    onChange(newRanked);
  };

  const moveDown = (idx: number) => {
    if (idx === ranked.length - 1) return;
    const newRanked = [...ranked];
    [newRanked[idx], newRanked[idx + 1]] = [newRanked[idx + 1], newRanked[idx]];
    setRanked(newRanked);
    onChange(newRanked);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Drag or use buttons to rank from most to least:</p>
      {ranked.map((item: string, idx: number) => (
        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
          <span className="font-bold text-blue-600 min-w-6">#{idx + 1}</span>
          <span className="flex-1">{item}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveDown(idx)}
              disabled={idx === ranked.length - 1}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const { taskType } = metadata || {};

  return (
    <div className="space-y-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
      {taskType === "photo" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload photo evidence 📸
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                  alert("File is too large (max 10MB)");
                  return;
                }
                onChange({ file, taskType: "photo" });
              }
            }}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          {value?.file && (
            <div className="mt-2 text-sm text-gray-600">
              ✓ Selected: {value.file.name}
            </div>
          )}
        </div>
      )}

      {taskType === "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submit your response 📝
          </label>
          <textarea
            value={value?.text || ""}
            onChange={(e) => onChange({ ...value, text: e.target.value, taskType: "text" })}
            placeholder="Type your response here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-1 text-xs text-gray-500">
            {(value?.text || "").length}/1000 characters
          </div>
        </div>
      )}

      {taskType === "physical" && (
        <div className="space-y-3">
          <p className="font-medium text-gray-800">Complete the task and confirm: ✅</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
              <input
                type="checkbox"
                checked={value?.completed || false}
                onChange={(e) => onChange({ ...value, completed: e.target.checked, taskType: "physical" })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">I have completed the task</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
              <input
                type="checkbox"
                checked={value?.proof || false}
                onChange={(e) => onChange({ ...value, proof: e.target.checked, taskType: "physical" })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">I have visual proof (video/photo)</span>
            </label>
          </div>
        </div>
      )}

      {!value && (
        <p className="text-xs text-gray-600">
          💡 Host will review submissions and award points based on creativity and completion
        </p>
      )}
    </div>
  );
}

function ConsensusInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  const { min, max, label } = metadata || {};

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          How would you rate on a scale of {min} to {max}?
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={min || 0}
            max={max || 100}
            value={value || Math.floor(((min || 0) + (max || 100)) / 2)}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-2xl font-bold text-blue-600 min-w-12 text-center">
            {value || Math.floor(((min || 0) + (max || 100)) / 2)}
          </div>
        </div>
      </div>
      {label && <p className="text-xs text-gray-600">{label}</p>}
    </div>
  );
}

function HiddenRevealInput({
  metadata,
  value,
  onChange,
}: {
  metadata: any;
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="space-y-3 bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
      <div className="text-center">
        <p className="text-lg font-bold text-purple-900">🔒 Mystery Answer</p>
        <p className="text-sm text-purple-700 mt-2">
          Answer will be revealed step by step. Make your guess now!
        </p>
      </div>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer"
        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
      />
    </div>
  );
}

function BuzzerInput({
  value,
  onChange,
}: {
  value: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="space-y-3 bg-red-50 p-4 rounded-lg border-2 border-red-200">
      <p className="text-sm text-gray-700 font-medium">
        Be the first to buzz in! Click the button when you know the answer.
      </p>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
          value
            ? "bg-red-600 text-white shadow-lg scale-95"
            : "bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg"
        }`}
      >
        {value ? "🔴 BUZZED IN!" : "🔴 BUZZ IN"}
      </button>
      {value && (
        <p className="text-center text-sm text-green-700 font-semibold">
          ✓ You buzzed in! Ready to answer when host asks.
        </p>
      )}
    </div>
  );
}
