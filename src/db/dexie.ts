import { Message } from "@/types";
import Dexie, { EntityTable } from "dexie";

import { User } from "@/types";

export const db = new Dexie("chat-app-db") as Dexie & {
  messages: EntityTable<Message, "id">;
  users: EntityTable<User & { createdAt: string; updatedAt: string }, "id">;
};

db.version(1).stores({
  messages:
    "++id, text, senderId, channelId, timestamp, status, isLocal, attachments",
  users: "id, username, status, lastSeen, createdAt, updatedAt",
});
