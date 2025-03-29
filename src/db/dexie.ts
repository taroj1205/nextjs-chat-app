import { Message } from "@/types";
import Dexie, { EntityTable } from "dexie";
import { nanoid } from "nanoid";

import { User } from "@/types";

export const db = new Dexie("chat-app-db") as Dexie & {
  messages: EntityTable<Message, "id">;
  user: EntityTable<User & { createdAt: string; updatedAt: string }, "id">;
};

db.version(1)
  .stores({
    messages:
      "++id, text, senderId, senderName, channelId, timestamp, status, isLocal, attachments",
    user: "id, username, status, lastSeen, createdAt, updatedAt",
  })
  .upgrade((tx) => {
    return tx.table("user").add({
      id: nanoid(),
      username: "User",
      status: "online",
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });
