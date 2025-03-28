"use client";

import { SYSTEM_INFO } from "@/constants";
import { db } from "@/db";
import { Message } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useMessaging(url: () => string) {
  const ref = useRef<WebSocket>(null);
  const target = useRef(url);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (ref.current) return;
    const socket = new WebSocket(target.current());
    ref.current = socket;

    console.log(ref.current);

    const getDefaultMessages = async () => {
      const messages = await db.messages.toArray();
      setMessages(messages);
    };
    getDefaultMessages();

    const controller = new AbortController();

    socket.addEventListener(
      "open",
      () => {
        console.log("Connection opened");
      },
      controller
    );

    socket.addEventListener(
      "message",
      async (event) => {
        console.log("Incoming event:", event);
        const payload =
          typeof event.data === "string" ? event.data : await event.data.text();
        const message = JSON.parse(payload) as Message;
        console.log("Incoming message:", message);
        console.log(message.senderId, SYSTEM_INFO.senderId, message.text);
        if (message.senderId !== SYSTEM_INFO.senderId) {
          await db.messages.add(message);
        }
        setMessages((p) => [...p, message]);
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
      },
      controller
    );

    return () => controller.abort();
  }, []);

  const sendMessage = useCallback(async (message: Omit<Message, "id">) => {
    if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;
    console.log("Outgoing message:", message);
    ref.current.send(JSON.stringify(message));
    const id = await db.messages.add(message);
    setMessages((p) => [...p, { id, ...message }]);
  }, []);

  return [messages, sendMessage] as const;
}
