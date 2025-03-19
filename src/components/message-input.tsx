import { Message } from "@/types";
import { SendIcon } from "@yamada-ui/lucide";
import { Button, HStack, IconButton, Input } from "@yamada-ui/react";
import { FC, memo, useCallback } from "react";

interface MessageInputProps {
  sendMessage: (message: Message) => void;
}

export const MessageInput: FC<MessageInputProps> = memo(({ sendMessage }) => {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const message = form.get("message") as string;

      console.log("Sending message:", message);

      sendMessage({
        id: crypto.randomUUID(),
        text: message.slice(0, 1000),
        senderId: crypto.randomUUID(),
        senderName: "User 1",
        channelId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      });
    },
    [sendMessage]
  );

  return (
    <HStack as="form" onSubmit={handleSubmit}>
      <Input
        maxLength={1000}
        isRequired
        name="message"
        type="text"
        placeholder="Type a message"
      />
      <IconButton type="submit" variant="subtle" colorScheme="primary">
        <SendIcon />
      </IconButton>
    </HStack>
  );
});

MessageInput.displayName = "MessageInput";
