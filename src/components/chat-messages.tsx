"use client";
import { useMessaging } from "@/utils/websocket";
import {
  For,
  ScrollArea,
  VStack,
  Text,
  HStack,
  useLocalStorage,
  Bleed,
  Box,
} from "@yamada-ui/react";
import { FC, memo } from "react";
import { MessageInput } from "./message-input";
import { MessageCard } from "./message-card";
import { db } from "@/db";
import { nanoid } from "nanoid";

interface ChatMessagesProps {
  hostname: string;
}

export const ChatMessages: FC<ChatMessagesProps> = memo(({ hostname }) => {
  const isProd = process.env.NODE_ENV === "production";

  const wsUrl = `http${isProd ? "s" : ""}://${hostname}/ws`;
  const [messages, sendMessage, onlineCount, userId] = useMessaging(
    () => wsUrl
  );

  return (
    <VStack maxH="100svh" h="100svh" w="full" px="md">
      <Bleed as={ScrollArea} h="full" inline="md" py="md">
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
