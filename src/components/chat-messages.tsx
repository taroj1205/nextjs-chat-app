"use client";
import { useMessaging } from "@/utils/websocket";
import {
  For,
  Grid,
  GridItem,
  ScrollArea,
  Text,
  VStack,
} from "@yamada-ui/react";
import { memo } from "react";
import { MessageInput } from "./message-input";
import { MessageCard } from "./message-card";
import { usePathname } from "next/navigation";

export const ChatMessages = memo(() => {
  const isProd = process.env.NODE_ENV === "production";
  const protocol = isProd ? "wss:" : "ws:";
  const host = isProd ? "chat.poyo.jp" : "localhost:3000";

  const wsUrl = `${protocol}//${host}/ws`;
  console.log(wsUrl);
  const [messages, sendMessage] = useMessaging(() => wsUrl);

  return (
    <Grid h="100svh" gridTemplateRows="1fr auto" w="full" p="md">
      <GridItem>
        <ScrollArea>
          <VStack>
            <For each={messages}>
              {(message) => <MessageCard key={message.id} message={message} />}
            </For>
          </VStack>
        </ScrollArea>
      </GridItem>
      <GridItem>
        <MessageInput sendMessage={sendMessage} />
      </GridItem>
    </Grid>
  );
});

ChatMessages.displayName = "ChatMessages";
