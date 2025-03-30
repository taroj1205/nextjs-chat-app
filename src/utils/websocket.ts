"use client";

import { SYSTEM_INFO } from "@/constants";
import { db } from "@/db";
import { Message } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

export function useMessaging(url: () => string) {
  const ref = useRef<WebSocket | null>(null);
  const target = useRef(url);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (ref.current) {
      if (
        ref.current.readyState === WebSocket.CONNECTING ||
        ref.current.readyState === WebSocket.OPEN
      ) {
        ref.current.close();
      }
      ref.current = null;
    }

    try {
      const socket = new WebSocket(target.current());
      // Set initial state
      setIsConnected(false);

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          console.log("Connection attempt timed out");
          socket.close();
          handleReconnect();
        }
      }, 5000); // 5 second timeout

      socket.addEventListener("open", () => {
        clearTimeout(connectionTimeout);
      });
      ref.current = socket;

      const handleReconnect = () => {
        if (ref.current) {
          ref.current.close();
          ref.current = null;
        }

        if (retryCount.current < maxRetries) {
          retryCount.current++;
          console.log(
            `Reconnection attempt ${retryCount.current}/${maxRetries}`
          );
          const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
          console.log(`Reconnecting in ${delay}ms`);
          setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
          retryCount.current = 0;
          setIsConnected(false);
        }
      };

      socket.addEventListener("error", (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);

        // Clean up the current socket instance before reconnecting
        if (ref.current) {
          ref.current.close();
          ref.current = null;
        }

        // Add a small delay before reconnecting to prevent rapid reconnection attempts
        setTimeout(() => {
          handleReconnect();
        }, 1000);
      });

      return socket;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setIsConnected(false);
      return null;
    }
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      return await db.messages.toArray();
    },
  });

  const { data: onlineCount = 0 } = useQuery({
    queryKey: ["onlineCount"],
    queryFn: () => Promise.resolve(0),
    enabled: false, // Initially disabled as it's updated via WebSocket
  });

  const { data: userId } = useQuery({
    queryKey: ["userId"],
    queryFn: async () => {
      const userId = localStorage.getItem("userId");
      console.log(userId);
      if (!userId) {
        const id = nanoid();
        localStorage.setItem("userId", id);
        return id;
      }
      return userId;
    },
  });

  useEffect(() => {
    const socket = connect();
    if (!socket) return;

    const controller = new AbortController();

    socket.addEventListener(
      "open",
      () => {
        console.log("Connection opened");
        setIsConnected(true);
        retryCount.current = 0;
      },
      controller
    );

    socket.addEventListener(
      "message",
      async (event) => {
        console.log("Incoming event:", event);
        const payload =
          typeof event.data === "string" ? event.data : await event.data.text();
        const data = JSON.parse(payload);

        if ("type" in data && data.type === "userCount") {
          console.log("User count:", data.count);
          queryClient.setQueryData(["onlineCount"], data.count);
          return;
        }

        const message = data as Message;
        console.log("Incoming message:", message);
        console.log(message.senderId, SYSTEM_INFO.senderId, message.text);
        if (message.senderId !== SYSTEM_INFO.senderId) {
          await db.messages.add(message);
        }
        queryClient.setQueryData(["messages"], (old: Message[] = []) => [
          ...old,
          message,
        ]);
      },
      controller
    );

    socket.addEventListener(
      "error",
      (error) => {
        console.error(
          "An error occurred while connecting to the server",
          error
        );
      },
      controller
    );

    socket.addEventListener(
      "close",
      (event) => {
        console.log("Connection closed", event.code, event.reason);
        setIsConnected(false);

        // Clean up the current socket instance
        if (ref.current) {
          ref.current.close();
          ref.current = null;
        }

        // Don't attempt to reconnect if it was a clean close
        if (event.wasClean) {
          console.log("Clean connection close, not attempting to reconnect");
          return;
        }

        // Attempt to reconnect with exponential backoff
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
          console.log(
            `Reconnecting in ${delay}ms (attempt ${retryCount.current}/${maxRetries})`
          );
          setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
          retryCount.current = 0;
          setIsConnected(false);
        }
      },
      controller
    );

    return () => {
      controller.abort();
      if (ref.current) {
        ref.current.close();
        ref.current = null;
      }
    };
  }, [queryClient, connect]);

  const sendMessage = useCallback(
    async (message: Omit<Message, "id">) => {
      if (!ref.current || ref.current.readyState !== ref.current.OPEN) {
        console.log("WebSocket not ready, attempting to reconnect...");
        connect();
        return;
      }
      console.log("Outgoing message:", message);
      try {
        ref.current.send(JSON.stringify(message));
        const id = await db.messages.add(message);
        queryClient.setQueryData(["messages"], (old: Message[] = []) => [
          ...old,
          { id, ...message },
        ]);
      } catch (error) {
        console.error("Failed to send message:", error);
        setIsConnected(false);
        connect(); // Use connect instead of handleReconnect since it's not in scope
      }
    },
    [queryClient, connect]
  );

  return [
    messages,
    sendMessage,
    onlineCount,
    userId,
    isConnected,
    connect,
    retryCount.current,
    maxRetries,
  ] as const;
}
