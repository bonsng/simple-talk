import { GalleryVerticalEnd } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="bg-muted dark:bg-primary flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center dark:text-white font-bold text-xl"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md dark:bg-card">
            <MessageCircle className="size-4 dark:bg-card dark:text-black" />
          </div>
          Simple Chat.
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
