"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Message = {
  id: string;
  username: string;
  content: string;
  reply_to_id: string | null;
  created_at: string;
};

const IMAGE_REGEX = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|bmp)(\?\S*)?$/i;

function isImageUrl(text: string) {
  return IMAGE_REGEX.test(text.trim());
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = localStorage.getItem("kuku_username");
    if (!name) {
      router.push("/");
      return;
    }
    setUsername(name);
  }, [router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !username) return;

    const { error } = await supabase.from("messages").insert({
      username,
      content: input.trim(),
      reply_to_id: replyTo?.id ?? null,
    });

    if (!error) {
      setInput("");
      setReplyTo(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const findMessageById = (id: string | null) =>
    id ? messages.find((m) => m.id === id) : undefined;

  if (!username) return null;

  return (
    <div className="flex h-screen flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h1 className="text-sm font-bold tracking-wide">
          連絡用チャット（ログイン中: {username}）
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {darkMode ? "☀ ライトモード" : "🌙 ダークモード"}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => {
          const quoted = findMessageById(msg.reply_to_id);
          return (
            <div key={msg.id} className="group mb-4">
              {quoted && (
                <div className="mb-1 ml-1 border-l-2 border-zinc-300 pl-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-500">
                  返信先: <span className="font-medium">{quoted.username}</span>{" "}
                  「
                  {quoted.content.length > 30
                    ? quoted.content.slice(0, 30) + "..."
                    : quoted.content}
                  」
                </div>
              )}

              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold">{msg.username}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDate(msg.created_at)}
                </span>
                <button
                  onClick={() => setReplyTo(msg)}
                  className="ml-auto text-xs text-zinc-400 opacity-0 transition hover:text-zinc-700 group-hover:opacity-100 dark:text-zinc-500 dark:hover:text-zinc-200"
                >
                  返信
                </button>
              </div>

              <div className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {isImageUrl(msg.content) ? (
                  <img
                    src={msg.content}
                    alt="投稿画像"
                    className="mt-1 max-h-72 max-w-xs rounded border border-zinc-200 dark:border-zinc-800"
                  />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">{replyTo.username}</span> への返信:{" "}
              {replyTo.content.length > 40
                ? replyTo.content.slice(0, 40) + "..."
                : replyTo.content}
            </span>
            <button
              onClick={() => setReplyTo(null)}
              className="ml-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力（Enterで送信 / Shift+Enterで改行）"
            rows={1}
            className="flex-1 resize-none rounded border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-400"
          />
          <button
            onClick={handleSend}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            送信
          </button>
        </div>
      </footer>
    </div>
  );
}
