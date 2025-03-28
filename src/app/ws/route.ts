import { SYSTEM_INFO } from "@/constants";
import { Message } from "@/types";
import { nanoid } from "nanoid";

export function GET() {
  console.log("GET request");
  const headers = new Headers();
  headers.set("Connection", "Upgrade");
  headers.set("Upgrade", "websocket");
  console.log("Upgrade Required");
  return new Response("Upgrade Required", { status: 426, headers });
}

export function SOCKET(
  client: import("ws").WebSocket,
  _request: import("node:http").IncomingMessage,
  server: import("ws").WebSocketServer
) {
  console.log("New client connected");
  for (const other of server.clients) {
    if (client === other || other.readyState !== other.OPEN) continue;
    other.send(
      JSON.stringify({
        id: nanoid(),
        senderId: SYSTEM_INFO.senderId,
        channelId: SYSTEM_INFO.channelId,
        timestamp: SYSTEM_INFO.timestamp,
        text: "A user joined the chat",
      } as Message)
    );
  }

  client.on("message", (message) => {
    console.log("Incoming message:", message);
    for (const other of server.clients)
      if (client !== other && other.readyState === other.OPEN)
        other.send(message);
  });

  client.send(
    JSON.stringify({
      id: nanoid(),
      senderId: SYSTEM_INFO.senderId,
      channelId: SYSTEM_INFO.channelId,
      timestamp: SYSTEM_INFO.timestamp,
      text: `There are ${server.clients.size - 1} other users online`,
    } as Message)
  );

  return () => {
    for (const other of server.clients) {
      if (client === other || other.readyState !== other.OPEN) continue;
      other.send(
        JSON.stringify({
          id: nanoid(),
          senderId: SYSTEM_INFO.senderId,
          channelId: SYSTEM_INFO.channelId,
          timestamp: SYSTEM_INFO.timestamp,
          text: "A user left the chat",
        } as Message)
      );
    }
  };
}
