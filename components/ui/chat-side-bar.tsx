import { Input } from "@/components/ui/input";
import { auth } from "@/auth";
import { MessageCircle } from "lucide-react";
import SendMessageDrawer from "@/components/ui/send-message-drawer";

export default async function ChatSideBar() {
  const session = await auth();
  return (
    <div className="flex h-full min-h-0 flex-col border border-white">
      {/*header part*/}
      <div className="flex flex-col p-5 gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-2xl font-medium">
            {session?.user?.name
              ? session.user.name.charAt(0).toUpperCase() +
                session.user.name.slice(1)
              : "Chat"}
          </div>
          <SendMessageDrawer type={"icon"} />
        </div>
        <Input placeholder="Type to search..." />
      </div>
      <div className="border-b px-5 py-2 text-lg">Messages</div>
      {/*chat list part*/}
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <div className="flex justify-center mb-3">
            <MessageCircle size={50} />
          </div>
          <h1 className="text-xl font-semibold">Your messages</h1>
          <p className="text-muted-foreground">
            Send a message to start a chat.
          </p>
          <SendMessageDrawer type={"button"} />
        </div>
      </div>
    </div>
  );
}
