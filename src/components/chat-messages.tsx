"use client";
import { useMessaging } from "@/utils/websocket";
import { For, ScrollArea, VStack, Bleed, Box } from "@yamada-ui/react";
import { FC, memo, useEffect, useRef } from "react";
import { MessageInput } from "./message-input";
import { MessageCard } from "./message-card";

interface ChatMessagesProps {
  hostname: string;
}

export const ChatMessages: FC<ChatMessagesProps> = memo(({ hostname }) => {
  const isProd = process.env.NODE_ENV === "production";
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const wsUrl = `http${isProd ? "s" : ""}://${hostname}/ws`;
  const [messages, sendMessage, onlineCount, userId] = useMessaging(
    () => wsUrl
  );

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollArea;
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 1;
    };

    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <VStack maxH="100svh" h="100svh" w="full" px="md">
      <Bleed as={ScrollArea} h="full" inline="md" py="md" ref={scrollAreaRef}>
        <VStack h="full">
          <For each={messages}>
            {(message) => (
              <MessageCard key={message.id} message={message} userId={userId} />
            )}
          </For>
          <Box minH="20" w="full" px="1rem" />
        </VStack>
      </Bleed>
      <MessageInput sendMessage={sendMessage} onlineCount={onlineCount} />
    </VStack>
  );
});

ChatMessages.displayName = "ChatMessages";
