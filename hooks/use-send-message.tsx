"use client";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ListRes, SentMessage } from "@/backend/chat-action";

export function useSendMessage(id: string, opts?: { onSent?: () => void }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: async (text: string) => {
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

      return (await res.json()) as SentMessage;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<InfiniteData<ListRes>>(
        ["conversation", id, "messages"],
        (old) => {
          if (!old) {
            return {
              pages: [
                {
                  items: [data],
                  nowPageNumber: 1,
                  totalPages: 1,
                  totalCount: 1,
                },
              ],
              pageParams: [1],
            };
          }
          const newPages = [...old.pages];
          const lastIndex = newPages.length - 1;
          const lastPage = newPages[lastIndex] as ListRes;
          newPages[lastIndex] = {
            ...lastPage,
            items: [...lastPage.items, data],
            totalCount: lastPage.totalCount + 1,
          };
          return { ...old, pages: newPages };
        },
      );
      requestAnimationFrame(() => opts?.onSent?.());
    },
  });

  return { mutate, isPending };
}
