import AddFriendButton from "@/components/ui/add-friend-button";
import RequestListButton from "@/components/ui/request-list-button";
import FriendList from "@/components/ui/friend-list";

export default function Page() {
  return (
    <div className="p-4 md:p-6 md:py-0 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-background">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Contacts
        </h1>
        <div className="flex items-center gap-3">
          <RequestListButton />
          <AddFriendButton />
        </div>
      </div>

      {/* Friends */}
      <FriendList />
    </div>
  );
}
