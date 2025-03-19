"use client";

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
        setMessages((p) => [...p, message]);
      },
      controller
    );

    socket.addEventListener(
      "error",
      () => {
        console.error("An error occurred while connecting to the server");
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

  const sendMessage = useCallback((message: Message) => {
    if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;
    console.log("Outgoing message:", message);
    ref.current.send(JSON.stringify(message));
    setMessages((p) => [...p, { ...message }]);
  }, []);

  return [messages, sendMessage] as const;
}
