"use client";
import { useMessaging } from "@/utils/websocket";
import { For, Grid, GridItem, ScrollArea, VStack } from "@yamada-ui/react";
import { FC, memo } from "react";
import { MessageInput } from "./message-input";
import { MessageCard } from "./message-card";

interface ChatMessagesProps {
  hostname: string;
}

export const ChatMessages: FC<ChatMessagesProps> = memo(({ hostname }) => {
  const isProd = process.env.NODE_ENV === "production";

  const wsUrl = `http${isProd ? "s" : ""}://${hostname}/ws`;
  const [messages, sendMessage] = useMessaging(() => wsUrl);

  return (
    <VStack maxH="100svh" h="100svh" w="full" p="md">
      <ScrollArea h="full" as={VStack}>
        <For each={messages}>
          {(message) => <MessageCard key={message.id} message={message} />}
        </For>
      </ScrollArea>
      <MessageInput sendMessage={sendMessage} />
    </VStack>
  );
});

ChatMessages.displayName = "ChatMessages";
