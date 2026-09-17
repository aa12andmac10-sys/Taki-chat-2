"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError("ニックネームを入力してください");
      return;
    }
    if (trimmed.length > 20) {
      setError("ニックネームは20文字以内にしてください");
      return;
    }

    localStorage.setItem("kuku_username", trimmed);
    router.push("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <form
        onSubmit={handleStart}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          連絡用チャット
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ニックネームを入力して始めましょう
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            ニックネーム
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例:たなか"
            maxLength={20}
            autoFocus
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          はじめる
        </button>
      </form>
    </div>
  );
}
