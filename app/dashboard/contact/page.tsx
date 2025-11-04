import AddFriendButton from "@/components/ui/add-friend-button";
import RequestListButton from "@/components/ui/request-list-button";
import FriendList from "@/components/ui/friend-list";

export default function Page() {
  return (
    <div className="h-full min-h-0 flex flex-col p-8 md:p-10 md:py-4">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-background flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Contacts
        </h1>
        <div className="flex items-center gap-3">
          <RequestListButton />
          <AddFriendButton />
        </div>
      </div>

      {/* Friends */}
      <div className="flex-1 min-h-0 overflow-hidden mt-8">
        <FriendList />
      </div>
    </div>
  );
}
