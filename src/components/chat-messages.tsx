"use client";
import { useMessaging } from "@/utils/websocket";
import {
  For,
  ScrollArea,
  VStack,
  Bleed,
  Box,
  IconButton,
} from "@yamada-ui/react";
import { FC, memo, useCallback, useEffect, useRef } from "react";
import { MessageInput } from "./message-input";
import { MessageCard } from "./message-card";
import { ArrowDownIcon } from "@yamada-ui/lucide";

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

  const handleScrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && scrollAreaRef.current) {
      handleScrollToBottom();
    }
  }, [messages]);

  return (
    <VStack maxH="100dvh" h="100dvh" w="full" px="md">
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
      <IconButton
        onClick={handleScrollToBottom}
        position="fixed"
        bottom="2xl"
        right="md"
        z={10}
        colorScheme="secondary"
        variant="subtle"
        rounded="full"
      >
        <ArrowDownIcon />
      </IconButton>
      <MessageInput sendMessage={sendMessage} onlineCount={onlineCount} />
    </VStack>
  );
});

ChatMessages.displayName = "ChatMessages";
