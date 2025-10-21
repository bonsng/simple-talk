import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutIcon() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button
        aria-label="logout button"
        variant="outline"
        size="icon"
        className="rounded-3xl absolute top-5 right-16"
      >
        <LogOut className="dark:text-white text-black" />
      </Button>
    </form>
  );
}
