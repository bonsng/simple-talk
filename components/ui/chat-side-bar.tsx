import { Input } from "@/components/ui/input";
import { auth } from "@/auth";
import SendMessageDrawer from "@/components/ui/send-message-drawer";
import ConversationsList from "@/components/ui/conversations-list";

export default async function ChatSideBar() {
  const session = await auth();
  return (
    <div className="flex h-full min-h-0 flex-col">
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
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <ConversationsList />
      </div>
    </div>
  );
}
