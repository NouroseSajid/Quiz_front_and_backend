"use client";

import { useState } from "react";
import type { QuestionInput, QuestionType, Difficulty, Category } from "@/lib/types";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
  { value: "RANGE", label: "Range Slider (Estimation)" },
  { value: "GEO", label: "GeoGuessr (Map Pin)" },
  { value: "TEXT_EXACT", label: "Text Answer (Exact)" },
  { value: "TEXT_CLOSE", label: "Text Answer (Number Proximity)" },
  { value: "TASK", label: "Taskmaster (Physical/Photo)" },
  { value: "CONSENSUS", label: "Consensus (Group Vibe)" },
  { value: "RANKING", label: "Ranking Order" },
  { value: "HIDDEN_REVEAL", label: "Hidden Reveal (Unblur)" },
  { value: "BUZZER", label: "Buzzer Duel" },
];

// Difficulty is now a numeric value from 1-455

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "Precision", label: "Precision (Sliders, Maps)" },
  { value: "Knowledge", label: "Knowledge (MCQ, Text)" },
  { value: "Chaos", label: "Chaos (Tasks, Creative)" },
  { value: "Social", label: "Social (Consensus, Voting)" },
];

interface QuestionFormProps {
  onSubmit: (question: QuestionInput) => Promise<void>;
  isLoading?: boolean;
}

export default function QuestionForm({
  onSubmit,
  isLoading = false,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<Partial<QuestionInput>>({
    type: "MULTIPLE_CHOICE",
    difficulty: 100,
    category: "Knowledge",
    pointsMax: 1000,
    timeLimit: 30,
    text: "",
    correct: null,
    metadata: {},
  });

  const [mcqOptions, setMcqOptions] = useState<Array<{ text: string; image?: string }>>(
    [
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
    ]
  );
  const [mcqCorrect, setMcqCorrect] = useState(0);
  const [mcqDisplayMode, setMcqDisplayMode] = useState<"text" | "image" | "mixed">("text");
  const [rangeMin, setRangeMin] = useState(0);
  const [rangeMax, setRangeMax] = useState(100);
  const [rangeCorrect, setRangeCorrect] = useState(50);
  const [geoLat, setGeoLat] = useState(0);
  const [geoLng, setGeoLng] = useState(0);
  const [textAnswers, setTextAnswers] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "type") {
      setFormData({ ...formData, [name]: value as QuestionType, metadata: {} });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMcqOptionChange = (index: number, field: "text" | "image", value: string) => {
    const newOptions = [...mcqOptions];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setMcqOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let finalData = { ...formData } as QuestionInput;

      // Build correct answer and metadata based on type
      switch (formData.type) {
        case "MULTIPLE_CHOICE":
          if (mcqOptions.some((opt) => !opt.text.trim())) {
            setSubmitError("All MCQ options must be filled");
            return;
          }
          finalData.correct = mcqOptions[mcqCorrect].text;
          finalData.metadata = { 
            options: mcqOptions,
            displayMode: mcqDisplayMode,
          };
          break;

        case "RANGE":
          finalData.correct = { value: rangeCorrect };
          finalData.metadata = {
            min: rangeMin,
            max: rangeMax,
            tolerance: 0.2,
          };
          break;

        case "GEO":
          if (!geoLat || !geoLng) {
            setSubmitError("Latitude and Longitude must be set for GeoGuessr");
            return;
          }
          finalData.correct = { lat: geoLat, lng: geoLng };
          finalData.metadata = {
            lat: geoLat,
            lng: geoLng,
            scope: "world",
            tolerance: 0.3,
          };
          break;

        case "TEXT_EXACT":
          if (!textAnswers.trim()) {
            setSubmitError("At least one answer must be provided");
            return;
          }
          const answers = textAnswers
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a);
          finalData.correct = { type: "string", values: answers };
          finalData.metadata = { acceptedAnswers: answers };
          break;

        case "TEXT_CLOSE":
          if (!textAnswers.trim()) {
            setSubmitError("A numeric answer must be provided");
            return;
          }
          const numAnswer = parseFloat(textAnswers);
          if (isNaN(numAnswer)) {
            setSubmitError("Must be a valid number for number proximity");
            return;
          }
          finalData.correct = { type: "number", value: numAnswer };
          finalData.metadata = { tolerance: 0.15 };
          break;

        case "TASK":
          finalData.correct = null;
          finalData.metadata = {
            taskType: "text",
            timeLimit: 120,
            votingFormat: "top2",
          };
          break;

        case "CONSENSUS":
          finalData.correct = null;
          finalData.metadata = {
            min: 0,
            max: 100,
            label: "%",
          };
          break;

        case "BUZZER":
          if (mcqOptions.some((opt) => !opt.trim())) {
            setSubmitError("All options must be filled for Buzzer");
            return;
          }
          finalData.correct = mcqOptions[mcqCorrect];
          finalData.metadata = { options: mcqOptions };
          break;

        default:
          finalData.correct = null;
          break;
      }

      // Validate required fields
      if (!finalData.text?.trim()) {
        setSubmitError("Question text is required");
        return;
      }

      await onSubmit(finalData);
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        type: "MULTIPLE_CHOICE",
        difficulty: 100,
        category: "Knowledge",
        pointsMax: 1000,
        timeLimit: 30,
        text: "",
        correct: null,
        metadata: {},
      });
      setMcqOptions(["", "", "", ""]);
      setMcqCorrect(0);
      setRangeMin(0);
      setRangeMax(100);
      setRangeCorrect(50);
      setGeoLat(0);
      setGeoLng(0);
      setTextAnswers("");

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit question"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Question Details
        </h2>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Question Text *
          </label>
          <textarea
            name="text"
            value={formData.text || ""}
            onChange={handleTextChange}
            placeholder="Enter your question here..."
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Question Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Difficulty * (1-455)
            </label>
            <input
              type="number"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleTextChange}
              min="1"
              max="455"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleTextChange}
              min="5"
              max="120"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Max Points
          </label>
          <input
            type="number"
            name="pointsMax"
            value={formData.pointsMax}
            onChange={handleTextChange}
            min="100"
            step="100"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Type-Specific Inputs */}
      <div className="space-y-4 border-t border-zinc-300 dark:border-zinc-700 pt-6">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {formData.type === "MULTIPLE_CHOICE" && "MCQ Options"}
          {formData.type === "RANGE" && "Range Settings"}
          {formData.type === "GEO" && "Location Settings"}
          {formData.type === "TEXT_EXACT" && "Accepted Answers"}
          {formData.type === "TEXT_CLOSE" && "Correct Number"}
          {formData.type === "TASK" && "Task Settings"}
          {formData.type === "CONSENSUS" && "Consensus Range"}
          {formData.type === "BUZZER" && "Buzzer Options"}
          {!["MULTIPLE_CHOICE", "RANGE", "GEO", "TEXT_EXACT", "TEXT_CLOSE", "TASK", "CONSENSUS", "BUZZER"].includes(
            formData.type as string
          ) && "Additional Settings"}
        </h2>

        {/* Multiple Choice */}
        {formData.type === "MULTIPLE_CHOICE" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Display Mode
              </label>
              <div className="flex gap-2">
                {(["text", "image", "mixed"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setMcqDisplayMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                      mcqDisplayMode === mode
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                Text: options only • Image: pictures only • Mixed: images + text
              </p>
            </div>

            <div className="space-y-3 border-t border-zinc-300 dark:border-zinc-700 pt-4">
              {mcqOptions.map((option, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Option {idx + 1} {idx === mcqCorrect && "(✓ Correct)"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleMcqOptionChange(idx, "text", e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setMcqCorrect(idx)}
                      className={`px-3 py-2 rounded-lg font-medium transition ${
                        mcqCorrect === idx
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                      }`}
                    >
                      Set Correct
                    </button>
                  </div>

                  {(mcqDisplayMode === "image" || mcqDisplayMode === "mixed") && (
                    <input
                      type="url"
                      value={option.image || ""}
                      onChange={(e) => handleMcqOptionChange(idx, "image", e.target.value)}
                      placeholder="Image URL (optional)"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {option.image && (
                    <div className="mt-2">
                      <img
                        src={option.image}
                        alt={`Option ${idx + 1}`}
                        className="h-24 w-24 object-cover rounded border border-zinc-300 dark:border-zinc-600"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Range */}
        {formData.type === "RANGE" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Minimum Value
              </label>
              <input
                type="number"
                value={rangeMin}
                onChange={(e) => setRangeMin(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Maximum Value
              </label>
              <input
                type="number"
                value={rangeMax}
                onChange={(e) => setRangeMax(parseFloat(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Correct Answer (The actual value)
              </label>
              <input
                type="number"
                value={rangeCorrect}
                onChange={(e) => setRangeCorrect(parseFloat(e.target.value) || 50)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* GeoGuessr */}
        {formData.type === "GEO" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Enter the latitude and longitude of the correct location
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={geoLat}
                  onChange={(e) => setGeoLat(parseFloat(e.target.value) || 0)}
                  placeholder="-90 to 90"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={geoLng}
                  onChange={(e) => setGeoLng(parseFloat(e.target.value) || 0)}
                  placeholder="-180 to 180"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Exact */}
        {formData.type === "TEXT_EXACT" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Accepted Answers (comma-separated)
            </label>
            <textarea
              value={textAnswers}
              onChange={(e) => setTextAnswers(e.target.value)}
              placeholder="e.g., Zambia, Zimbabwe"
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Text Close (Number) */}
        {formData.type === "TEXT_CLOSE" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Correct Number
            </label>
            <input
              type="number"
              value={textAnswers}
              onChange={(e) => setTextAnswers(e.target.value)}
              placeholder="e.g., 54"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Task */}
        {formData.type === "TASK" && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Task questions require players to complete a real-world challenge. They'll submit photos or text, and other players will vote on the best submission.
            </p>
          </div>
        )}

        {/* Consensus */}
        {formData.type === "CONSENSUS" && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Consensus questions ask players to estimate a percentage. The correct answer is the average of all player responses.
            </p>
          </div>
        )}

        {/* Buzzer */}
        {formData.type === "BUZZER" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              First player to buzz gets to answer. If wrong, others can steal.
            </p>
            {mcqOptions.map((option, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Option {idx + 1} {idx === mcqCorrect && "(✓ Correct)"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleMcqOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMcqCorrect(idx)}
                    className={`px-3 py-2 rounded-lg font-medium transition ${
                      mcqCorrect === idx
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                    }`}
                  >
                    Set Correct
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {submitError && (
        <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-100">{submitError}</p>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-100">
            ✓ Question submitted successfully!
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition"
      >
        {isLoading ? "Submitting..." : "Create Question"}
      </button>
    </form>
  );
}
