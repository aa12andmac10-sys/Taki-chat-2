"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyLogin } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("IDとパスワードを入力してください");
      return;
    }

    setLoading(true);
    const result = await verifyLogin(username, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.message ?? "ログインに失敗しました");
      return;
    }

    localStorage.setItem("kuku_username", result.username!);
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-8"
      >
        <h1 className="mb-6 text-center text-xl font-bold tracking-wide">
          c.kuku.lu風チャット
        </h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-zinc-400">ID</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            autoComplete="username"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm text-zinc-400">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-zinc-100 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-50"
        >
          {loading ? "確認中..." : "入室する"}
        </button>
      </form>
    </div>
  );
}
