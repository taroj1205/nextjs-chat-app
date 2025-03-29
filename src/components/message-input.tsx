import { Message } from "@/types";
import { SendIcon } from "@yamada-ui/lucide";
import {
  Box,
  Center,
  Float,
  HStack,
  IconButton,
  Input,
  Tag,
  Textarea,
  VStack,
} from "@yamada-ui/react";
import { FC, memo, useCallback, useRef } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";

interface MessageInputProps {
  sendMessage: (message: Omit<Message, "id">) => void;
  onlineCount: number;
}

export const MessageInput: FC<MessageInputProps> = memo(
  ({ sendMessage, onlineCount }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = useCallback(() => {
      event.preventDefault();
      const message = textareaRef.current?.value;

      if (!message || message.trim() === "") return;

      console.log("Sending message:", message);

      let senderId = localStorage.getItem("userId");

      if (!senderId) {
        const newId = nanoid();
        localStorage.setItem("userId", newId);
        senderId = newId;
      }

      sendMessage({
        text: message.slice(0, 1000),
        senderId: senderId,
        senderName: "User",
        channelId: nanoid(),
        timestamp: new Date().toISOString(),
      });
      if (textareaRef.current) textareaRef.current.value = "";
    }, [sendMessage]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && event.shiftKey === false) {
          event.preventDefault();
          handleSubmit();
        }
      },
      [handleSubmit]
    );

    return (
      <VStack
        gap="xs"
        position="fixed"
        bottom="0"
        left="0"
        py="sm"
        px="md"
        w="full"
        bg="blackAlpha.500"
        backdropFilter="blur(10px)"
      >
        {onlineCount > 0 && (
          <Center as={Tag} colorScheme="primary" w="fit-content">
            {onlineCount} Online
          </Center>
        )}
        <HStack as="form" onSubmit={handleSubmit} w="full" position="relative">
          <Textarea
            autosize
            maxLength={1000}
            required
            name="message"
            placeholder="Type a message"
            ref={textareaRef}
            bg={["white", "black"]}
            onKeyDown={handleKeyDown}
          />
          <IconButton type="submit" variant="subtle" colorScheme="primary">
            <SendIcon />
          </IconButton>
        </HStack>
      </VStack>
    );
  }
);

MessageInput.displayName = "MessageInput";
