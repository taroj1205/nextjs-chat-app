import { ChatMessages } from "@/components/chat-messages";
import { headers } from "next/headers";

export default async function Chat() {
  const headersList = await headers();
  const hostname = headersList.get("x-forwarded-host") ?? "localhost:3000";
  console.log(hostname);
  return (
    <>
      <ChatMessages hostname={hostname} />
    </>
  );
}
