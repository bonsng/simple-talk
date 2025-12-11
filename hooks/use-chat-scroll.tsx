import { SentMessage } from "@/backend/chat-action";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

type UseChatScrollParams = {
  listRef: React.RefObject<HTMLDivElement | null>;
  messages: SentMessage[];
  initialLoading: boolean;
  hasPreviousPage: boolean;
  isFetchingPreviousPage: boolean;
  fetchPreviousPage: () => void;
};

export const useChatScroll = ({
  listRef,
  messages,
  initialLoading,
  hasPreviousPage,
  isFetchingPreviousPage,
  fetchPreviousPage,
}: UseChatScrollParams) => {
  const [prevHeight, setPrevHeight] = useState(0);
  const didInitialScrollRef = useRef(false);
  const wasFetchingPrevRef = useRef(false);
  const { ref: observerRef, inView } = useInView();

  /**
   * Scroll Logics
   */

  const scrollToBottom = useCallback(
    (smooth = false) => {
      const el = listRef.current;
      if (!el) return;
      requestAnimationFrame(() => {
        const target = Math.max(0, el.scrollHeight - el.clientHeight);
        el.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
      });
    },
    [listRef],
  );

  useEffect(() => {
    if (!initialLoading && messages.length && !didInitialScrollRef.current) {
      didInitialScrollRef.current = true;
      scrollToBottom(false);
    }
  }, [initialLoading, messages.length, scrollToBottom]);

  useEffect(() => {
    const el = listRef.current;
    // 이전에 이전 페이지를 로딩 중이었다가, 이제 막 끝난 시점
    if (wasFetchingPrevRef.current && !isFetchingPreviousPage && el) {
      const newHeight = el.scrollHeight;
      const diff = newHeight - prevHeight;
      if (diff > 0) {
        el.scrollTop = el.scrollTop + diff;
      }
    }
    wasFetchingPrevRef.current = isFetchingPreviousPage;
  }, [isFetchingPreviousPage, listRef, prevHeight]);

  useEffect(() => {
    if (inView && hasPreviousPage && !isFetchingPreviousPage) {
      setPrevHeight(listRef.current?.scrollHeight ?? 0);
      fetchPreviousPage();
    }
  }, [
    fetchPreviousPage,
    hasPreviousPage,
    inView,
    isFetchingPreviousPage,
    listRef,
  ]);

  return { observerRef, scrollToBottom };
};
