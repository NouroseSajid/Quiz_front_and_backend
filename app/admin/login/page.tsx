"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted)]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--muted)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
            />
          </div>
          {error && <p className="text-[var(--danger)] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-strong)] disabled:opacity-50 font-medium transition"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
        >
          &larr; Back to Home
        </button>
      </div>
    </main>
  );
}
