"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { SentMessage, type ListRes } from "@/backend/chat-action";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import ChatHeader from "@/components/ui/chat-header";
import TextareaAutosize from "react-textarea-autosize";
import { clsx } from "clsx";
import { makePusherClient } from "@/lib/pusher";
import { formatDateLabel, isSameDay } from "@/lib/date-functions";
import { useChatList } from "@/hooks/use-chat-list";
import { useSendMessage } from "@/hooks/use-send-message";
import { useMe } from "@/hooks/use-me";
import { useChatMeta } from "@/hooks/use-chat-meta";
import { useChatScroll } from "@/hooks/use-chat-scroll";

export default function Page() {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const { meId } = useMe();
  const listRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  /**
   * Message load
   */
  const {
    totalPages: lastPage,
    totalCount: messageCount,
    isLoading: isTotalLoading,
  } = useChatMeta(id);

  const {
    messages,
    isFetching,
    isFetchingPreviousPage,
    hasPreviousPage,
    fetchPreviousPage,
  } = useChatList(String(id), lastPage, messageCount);

  const initialLoading = isTotalLoading || isFetching;

  const { observerRef, scrollToBottom } = useChatScroll({
    listRef,
    messages,
    initialLoading,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
  });

  /**
   * Pusher connection
   */
  useEffect(() => {
    if (!id) return;
    const pusher = makePusherClient();
    const channelName = `conversation-${Number(id)}`;
    const channel = pusher.subscribe(channelName);

    const onNew = (msg: SentMessage) => {
      // 내가 보낸 메시지는 useSendMessage 쪽에서 이미 캐시에 반영된다고 가정
      if (meId && msg.senderId === meId) return;

      // 1) 현재 대화의 메시지 리스트 캐시에 새 메시지를 추가
      queryClient.setQueryData<InfiniteData<ListRes>>(
        ["conversation", String(id), "messages"],
        (old) => {
          if (!old) return old;

          const newPages = [...old.pages];
          if (newPages.length === 0) {
            return {
              pages: [
                {
                  items: [msg],
                  nowPageNumber: 1,
                  totalPages: 1,
                  totalCount: 1,
                },
              ],
              pageParams: [1],
            };
          }

          const lastIndex = newPages.length - 1;
          const lastPage = newPages[lastIndex] as ListRes;

          newPages[lastIndex] = {
            ...lastPage,
            items: [...lastPage.items, msg],
            totalCount: lastPage.totalCount + 1,
          };

          return {
            ...old,
            pages: newPages,
          };
        },
      );

      // 2) 화면을 맨 아래로 스크롤
      requestAnimationFrame(() => scrollToBottom(true));
    };

    channel.bind("message:new", onNew);

    return () => {
      channel.unbind("message:new", onNew);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [id, meId, scrollToBottom, queryClient]);

  /**
   * Send Logics
   */
  const { mutate, isPending: isSendPending } = useSendMessage(String(id), {
    onSent: () => scrollToBottom(true),
  });

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !id) return;
    mutate(text);
    setInput("");
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden p-4"
      id="chat-container"
    >
      <ChatHeader id={String(id)} />

      {/*chat contents*/}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-2 p-4"
        id="chat-contents-container"
      >
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
            const isFirst = idx === 0;
            return (
              <React.Fragment key={msg.id}>
                {isFirst && hasPreviousPage && !initialLoading && (
                  <div ref={observerRef} className="flex justify-center">
                    {isFetchingPreviousPage && <Spinner className="size-3" />}
                  </div>
                )}
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              const native = e.nativeEvent as unknown as {
                isComposing?: boolean;
                keyCode?: number;
              };
              const isComposing = native.isComposing || native.keyCode === 229;
              // 한글 등 IME 조합 중에는 전송하지 않기
              if (isComposing) return;

              e.preventDefault();
              const text = input.trim();
              if (text && id) {
                mutate(text);
                setInput("");
              }
            }
          }}
        />
        <div className="px-3 py-2 flex justify-end items-end flex-1">
          <Button
            type="submit"
            variant="outline"
            disabled={isSendPending}
            className="w-14"
          >
            {isSendPending ? <Spinner /> : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
