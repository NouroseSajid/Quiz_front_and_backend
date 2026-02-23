use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/lobby/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      // store identifiers
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("gameId", data.gameId);
      router.push(`/lobby/${data.gameId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow rounded">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Lobby</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </main>
  );
}
