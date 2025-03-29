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

  const connect = useCallback(() => {
    if (ref.current) {
      ref.current.close();
      ref.current = null;
    }

    const socket = new WebSocket(target.current());
    ref.current = socket;
    return socket;
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

    const controller = new AbortController();

    socket.addEventListener(
      "open",
      () => {
        console.log("Connection opened");
        setIsConnected(true);
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
        if (event.wasClean) return;
        console.log("Connection closed");
        setIsConnected(false);
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
      if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;
      console.log("Outgoing message:", message);
      ref.current.send(JSON.stringify(message));
      const id = await db.messages.add(message);
      queryClient.setQueryData(["messages"], (old: Message[] = []) => [
        ...old,
        { id, ...message },
      ]);
    },
    [queryClient]
  );

  return [
    messages,
    sendMessage,
    onlineCount,
    userId,
    isConnected,
    connect,
  ] as const;
}
