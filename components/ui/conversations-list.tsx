"use client";

import { ConversationPreview } from "@/backend/chat-action";
import { MessageCircle } from "lucide-react";
import SendMessageDrawer from "@/components/ui/send-message-drawer";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

async function fetchConversations(): Promise<ConversationPreview[]> {
  const res = await fetch("/api/chat/direct/list", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch conversation list");
  const data = await res.json();
  return data.items ?? [];
}

export default function ConversationsList() {
  const { data: chatList, isLoading } = useQuery({
    queryKey: ["conversation-list"],
    queryFn: fetchConversations,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  if (!chatList && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center mt-12">
        <MessageCircle size={50} className="mb-3" />
        <h1 className="text-xl font-semibold">Your messages</h1>
        <p className="text-muted-foreground mb-3">
          Loading your conversations...
        </p>
      </div>
    );
  }

  if (!chatList || chatList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center mt-12">
        <MessageCircle size={50} className="mb-3" />
        <h1 className="text-xl font-semibold">Your messages</h1>
        <p className="text-muted-foreground mb-3">
          Send a message to start a chat.
        </p>
        <SendMessageDrawer type={"button"} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chatList?.map(
        (c: ConversationPreview) =>
          c.lastMessageBody && (
            <Link
              key={c.conversationId}
              href={`/dashboard/chat/t/${c.conversationId}`}
              className="block rounded-md border p-3 hover:bg-accent transition"
            >
              <div className="font-medium truncate">{c.otherUserName}</div>
              <div className="text-sm text-muted-foreground truncate">
                {c.otherUserEmail}
              </div>

              <div className="text-lg font-bold truncate mt-1">
                {c.lastMessageBody}
              </div>

              {c.lastMessageAt && (
                <div className="text-xs text-muted-foreground text-right mt-1">
                  {new Date(c.lastMessageAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </Link>
          ),
      )}
    </div>
  );
}
