import { memo } from "react";
import type { Message } from "@/types";
import { Box, Text } from "@yamada-ui/react";

export const MessageCard = memo(({ message }: { message: Message }) => {
  return (
    <Box
      bg="gray.700"
      px="4"
      py="2"
      borderRadius="lg"
      _dark={{ bg: "gray.900" }}
    >
      <Text fontSize="sm">{message.text}</Text>
    </Box>
  );
});

MessageCard.displayName = "MessageCard";
