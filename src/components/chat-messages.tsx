"use client";
import { useMessaging } from "@/utils/websocket";
import { For, Text, VStack } from "@yamada-ui/react";
import { memo } from "react";
import { MessageInput } from "./message-input";
import { MessageCard } from "./message-card";

export const ChatMessages = memo(() => {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL(window.location.href);
  const [messages, sendMessage] = useMessaging(
    () => `${protocol}//${url.host}${url.pathname}/ws`
  );
  return (
    <VStack>
      <For each={messages}>
        {(message) => <MessageCard key={message.id} message={message} />}
      </For>
      <MessageInput sendMessage={sendMessage} />
    </VStack>
  );
});

ChatMessages.displayName = "ChatMessages";
