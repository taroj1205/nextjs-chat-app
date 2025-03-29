
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
    other.send(
      JSON.stringify({
        type: "userCount",
        count: server.clients.size,
      })
    );
  }

  client.on("message", (message) => {
    console.log("Incoming message:", message);
    for (const other of server.clients)
      if (client !== other && other.readyState === other.OPEN)
        other.send(message);
  });

  return () => {
    for (const other of server.clients) {
      other.send(
        JSON.stringify({
          type: "userCount",
          count: server.clients.size,
        })
      );
    }
  };
}
