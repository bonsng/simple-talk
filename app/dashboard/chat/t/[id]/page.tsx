"use client";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SentMessage } from "@/backend/chat-action";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ChatHeader from "@/components/ui/chat-header";
import TextareaAutosize from "react-textarea-autosize";
import { clsx } from "clsx";

export default function Page() {
  const { id } = useParams();
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const { id } = await fetch("/api/search/me").then((r) => r.json());
      if (id) {
        setMeId(id);
      }
    })();
  }, []);

  const scrollToBottom = (smooth = false) => {
    const el = listRef.current;
    if (!el) return;
    // ensure layout is settled before measuring
    requestAnimationFrame(() => {
      const target = Math.max(0, el.scrollHeight - el.clientHeight);
      el.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
    });
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const formatDateLabel = (d: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, yesterday)) return "Yesterday";
    return d.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  type ListRes = { items: SentMessage[]; nextCursor: number | null };

  const loadInitial = useCallback(async () => {
    if (!id) return;
    try {
      setInitialLoading(true);
      const res = await fetch(
        `/api/chat/direct/messages?cid=${Number(id)}&limit=20`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Failed to load messages");
      const data: ListRes = await res.json();
      setMessages(data.items);
      setCursor(data.nextCursor);

      requestAnimationFrame(() => scrollToBottom(false));
    } catch (e) {
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  }, [id]);

  const loadMore = useCallback(async () => {
    if (!id || !cursor) return;
    try {
      setLoadingMore(true);
      const res = await fetch(
        `/api/chat/direct/messages?cid=${Number(id)}&cursor=${cursor}&limit=20`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Failed to load messages");
      const data: ListRes = await res.json();
      setMessages((prev) => [...data.items, ...prev]);
      setCursor(data.nextCursor);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [id, cursor]);

  useEffect(() => {
    setMessages([]);
    setCursor(null);
    loadInitial();
  }, [loadInitial]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSendLoading(true);
    const text = input.trim();
    if (!text) {
      setSendLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat/direct/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: Number(id),
          body: text,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to send message");
      }

      const data: SentMessage = await res.json();
      setMessages((prev) => [...prev, data]);
      setInput("");
      // scroll to bottom so the new message is visible
      requestAnimationFrame(() => scrollToBottom(true));
    } catch (err) {
      console.error(err);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <ChatHeader id={String(id)} />

      {/*chat contents*/}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-2 p-4"
      >
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={initialLoading || loadingMore || !cursor}
            onClick={loadMore}
          >
            {initialLoading
              ? "Loading..."
              : cursor
                ? loadingMore
                  ? "Loading more..."
                  : "Load older messages"
                : "No more messages"}
          </Button>
        </div>

        {messages.length === 0 && !initialLoading ? (
          <p className="text-muted-foreground text-sm text-center">
            No messages yet. Start chatting!
          </p>
        ) : (
          messages.map((msg, idx) => {
            const d = new Date(msg.createdAt);
            const prev = messages[idx - 1];
            const showSeparator =
              idx === 0 || !isSameDay(d, new Date(prev.createdAt));
            const isMe = meId === msg.senderId;
            return (
              <React.Fragment key={msg.id}>
                {showSeparator && (
                  <div className="my-3 flex items-center text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    <span className="mx-3 whitespace-nowrap">
                      {formatDateLabel(d)}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <div
                  className={clsx("flex", {
                    "justify-start": !isMe,
                    "justify-end": isMe,
                  })}
                >
                  <div className="inline-flex w-fit max-w-[70%]">
                    <div className={`flex gap-2 ${isMe && "flex-row-reverse"}`}>
                      <div
                        className={clsx("px-3 py-2 rounded-lg ", {
                          "bg-blue-500 text-white": isMe,
                          "bg-muted": !isMe,
                        })}
                      >
                        {msg.body}
                      </div>
                      <div className="self-end text-[10px] opacity-80 text-right">
                        {d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/*Chat input*/}
      <form
        onSubmit={sendMessage}
        className="flex w-full max-w-full border flex-shrink-0"
      >
        <TextareaAutosize
          data-slot="input-group-control"
          className="flex field-sizing-content min-h-0 max-h-28 overflow-y-auto w-full resize-none rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none md:text-lg"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="px-3 py-2 flex justify-end items-end flex-1">
          <Button
            type="submit"
            variant="outline"
            disabled={sendLoading}
            className="w-14"
          >
            {sendLoading ? <Spinner /> : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
