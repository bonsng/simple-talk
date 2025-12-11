"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { ListRes, SentMessage } from "@/backend/chat-action";

/**
 * @param id            conversationId (string)
 * @param lastPage      last page num
 * @param messageCount
 */
export const useChatList = (
  id: string,
  lastPage: number | undefined,
  messageCount: number | undefined,
) => {
  const initialPage = lastPage && lastPage > 0 ? lastPage : 1;
  const count = messageCount && messageCount > 0 ? messageCount : 0;
  const {
    data,
    isFetching,
    isFetchingPreviousPage,
    hasPreviousPage,
    fetchPreviousPage,
  } = useInfiniteQuery<ListRes>({
    queryKey: ["conversation", id, "messages"],
    initialPageParam: initialPage,
    getNextPageParam: () => undefined,
    queryFn: async ({ pageParam }) => {
      if (!id) throw new Error("missing conversation id");
      const page = (pageParam as number) ?? initialPage;
      const params = new URLSearchParams();
      params.set("cid", String(Number(id)));
      params.set("total", String(initialPage));
      params.set("page", String(page));
      params.set("count", String(count));

      const res = await fetch(
        `/api/chat/direct/messages?${params.toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Failed to load messages");
      return (await res.json()) as ListRes;
    },
    getPreviousPageParam: (
      firstPage,
      _allPages,
      _firstPageParam,
      _allPageParams,
    ) => {
      const current = firstPage.nowPageNumber;
      return current > 1 ? current - 1 : undefined;
    },
    enabled: !!id && !!lastPage,
  });

  const messages: SentMessage[] =
    data?.pages.flatMap((page) => page.items) ?? [];

  return {
    messages,
    isFetching,
    isFetchingPreviousPage,
    hasPreviousPage,
    fetchPreviousPage,
  };
};
