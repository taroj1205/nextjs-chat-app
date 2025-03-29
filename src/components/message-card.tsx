import { memo } from "react";
import type { Message } from "@/types";
import {
  Avatar,
  Box,
  HStack,
  Text,
  VStack,
  Image,
  Icon,
  Link,
  Tooltip,
  Card,
  CardBody,
  Skeleton,
  Separator,
} from "@yamada-ui/react";
import { format, isValid } from "date-fns";
import {
  FileIcon,
  CheckIcon,
  CheckCheckIcon,
  EyeIcon,
  CloudOffIcon,
  CircleAlertIcon,
} from "@yamada-ui/lucide";

export const MessageCard = memo(
  ({ message, userId }: { message: Message; userId: string | undefined }) => {
    const isOwnMessage = message.senderId === userId;

    // Format timestamp safely
    const formattedTime =
      message.timestamp && isValid(new Date(message.timestamp))
        ? format(new Date(message.timestamp), "h:mm a")
        : "";

    const formattedDate =
      message.timestamp && isValid(new Date(message.timestamp))
        ? format(new Date(message.timestamp), "PPpp")
        : "";

    // Status icons
    const statusIcons = {
      sent: (
        <Icon
          as={CheckIcon}
          boxSize="xs"
          color={isOwnMessage ? ["blue", "blue.300"] : ["gray", "gray.400"]}
        />
      ),
      delivered: (
        <Icon
          as={CheckCheckIcon}
          boxSize="xs"
          color={isOwnMessage ? ["blue", "blue.300"] : ["gray", "gray.400"]}
        />
      ),
      seen: (
        <Icon
          as={EyeIcon}
          boxSize="xs"
          color={isOwnMessage ? ["blue", "blue.300"] : ["gray", "gray.400"]}
        />
      ),
      error: <Icon as={CircleAlertIcon} boxSize="xs" color="danger" />,
    };

    return (
      <HStack
        w="full"
        align="flex-start"
        gap="md"
        py="sm"
        px="md"
        _hover={{
          bg: ["blackAlpha.50", "whiteAlpha.50"],
        }}
        transition="background 0.2s ease"
        borderRadius="md"
      >
        {/* Avatar always on the left */}
        <Avatar
          name={message.senderName || "User"}
          size="sm"
          colorScheme={isOwnMessage ? "primary" : "gray"}
          opacity={isOwnMessage ? 0.9 : 1}
        />

        {/* Message content */}
        <VStack align="flex-start" gap="xs" minW={0}>
          {/* Header with name, time and status */}
          <HStack w="full" gap="sm">
            <HStack gap="sm">
              <Text
                fontWeight="medium"
                fontSize="sm"
                color={isOwnMessage ? "primary" : ["gray", "gray.400"]}
              >
                {message.senderName}
              </Text>

              {message.isLocal && (
                <Tooltip label="Saving locally">
                  <Icon as={CloudOffIcon} boxSize="xs" color="warning" />
                </Tooltip>
              )}
            </HStack>

            <HStack gap="xs">
              {message.status && statusIcons[message.status]}

              <Tooltip label={formattedDate} placement="top">
                <Text
                  fontSize="xs"
                  color={
                    isOwnMessage
                      ? ["primary", "primary.300"]
                      : ["gray", "gray.400"]
                  }
                  whiteSpace="nowrap"
                >
                  {formattedTime}
                </Text>
              </Tooltip>
            </HStack>
          </HStack>

          {/* Message bubble */}
          <Card
            bg={
              isOwnMessage
                ? ["primary.50", "primary.900"]
                : ["gray.50", "gray.800"]
            }
            borderWidth={1}
            borderColor={
              isOwnMessage
                ? ["primary.200", "primary.700"]
                : ["gray.200", "gray.700"]
            }
            borderRadius="lg"
            overflow="hidden"
            maxW="95%"
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{
              boxShadow: "md",
              transform: "translateY(-1px)",
            }}
          >
            <CardBody py="sm" px="md">
              {/* Message text */}
              {message.text && (
                <Text
                  color={["gray.800", "whiteAlpha.900"]}
                  wordBreak="break-word"
                  whiteSpace="pre-wrap"
                >
                  {message.text}
                </Text>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <VStack
                  align="flex-start"
                  w="full"
                  gap="sm"
                  paddingTop={message.text ? "sm" : 0}
                >
                  {message.text && <Separator />}

                  {message.attachments.map((attachment, index) => (
                    <Box key={index} w="full">
                      {attachment.type === "image" ? (
                        <VStack align="flex-start" gap="xs">
                          <Image
                            src={attachment.url}
                            alt={`Image: ${attachment.name || "Attachment"}`}
                            borderRadius="md"
                            maxH="200px"
                            objectFit="cover"
                            w="auto"
                            fallback={
                              <Skeleton h="120px" w="200px" borderRadius="md" />
                            }
                            loading="lazy"
                            transition="transform 0.3s ease"
                            _hover={{
                              transform: "scale(1.02)",
                            }}
                          />
                          <Text
                            fontSize="xs"
                            color={
                              isOwnMessage
                                ? ["primary", "primary.300"]
                                : ["gray", "gray.400"]
                            }
                          >
                            {attachment.name || "Image"}
                            {attachment.size && (
                              <> · {Math.round(attachment.size / 1024)} KB</>
                            )}
                          </Text>
                        </VStack>
                      ) : (
                        <Link
                          href={attachment.url}
                          external
                          display="flex"
                          alignItems="center"
                          gap="sm"
                          p="sm"
                          borderRadius="md"
                          bg={["blackAlpha.50", "whiteAlpha.50"]}
                          _hover={{
                            bg: ["blackAlpha.100", "whiteAlpha.100"],
                            textDecoration: "none",
                          }}
                          transition="all 0.2s"
                          title={attachment.name}
                        >
                          <Icon
                            as={FileIcon}
                            color={
                              isOwnMessage
                                ? ["primary", "primary.300"]
                                : ["gray", "gray.400"]
                            }
                            boxSize="md"
                          />
                          <VStack align="flex-start" gap={0} flex={1} minW={0}>
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                              w="full"
                            >
                              {attachment.name || "File"}
                            </Text>
                            {attachment.size && (
                              <Text
                                fontSize="xs"
                                color={
                                  isOwnMessage
                                    ? ["primary", "primary.300"]
                                    : ["gray", "gray.400"]
                                }
                              >
                                {Math.round(attachment.size / 1024)} KB
                              </Text>
                            )}
                          </VStack>
                        </Link>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}

              {/* Error message */}
              {message.status === "error" && (
                <Text color="danger" fontSize="xs" paddingTop="xs">
                  Message failed to send. Tap to retry.
                </Text>
              )}
            </CardBody>
          </Card>
        </VStack>
      </HStack>
    );
  }
);

MessageCard.displayName = "MessageCard";
