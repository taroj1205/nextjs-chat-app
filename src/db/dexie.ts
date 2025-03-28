import { Message } from "@/types";
import Dexie, { EntityTable } from "dexie";

export const db = new Dexie("chat-app-db") as Dexie & {
  messages: EntityTable<Message, "id">;
};

db.version(1).stores({
  messages:
    "++id, text, senderId, senderName, channelId, timestamp, status, isLocal, attachments",
});
