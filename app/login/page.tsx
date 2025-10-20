"use client";
import { MessageCircle } from "lucide-react";
import { LoginForm } from "@/components/account/login-form";
import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      const email = searchParams.get("email");
      toast.success(
        email
          ? `${email} has been registered successfully!`
          : "Account created successfully!",
      );
    }
  }, [searchParams]);

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
