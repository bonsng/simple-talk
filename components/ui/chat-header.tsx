import React, { useCallback, useEffect, useState } from "react";
import { ConversationHeader } from "@/backend/chat-action";
import { getInitials } from "@/lib/get-initial";

export default function ChatHeader({ id }: { id: string }) {
  const [header, setHeader] = useState<ConversationHeader | null>(null);
  const cid = Number(id);

  const loadHeader = useCallback(async () => {
    if (!id || Number.isNaN(cid)) return;
    const res = await fetch(`/api/chat/direct/header?cid=${cid}`);
    if (!res.ok) throw new Error("Failed to fetch chat header.");
    const data: ConversationHeader = await res.json();
    setHeader(data);
  }, [id, cid]);

  useEffect(() => {
    loadHeader();
  }, [loadHeader]);

  return (
    <div className="border-b pb-2 text-lg font-semibold flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold">
        {getInitials(header?.otherUserName ?? id)}
      </div>
      {header?.otherUserName ?? id}
    </div>
  );
}
