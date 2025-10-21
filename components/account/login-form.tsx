"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/backend/account-action";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const signup = searchParams.get("signup");
  const signupEmail = searchParams.get("email");

  const { pending } = useFormStatus();

  useEffect(() => {
    if (signup === "success" && signupEmail) {
      setEmail(signupEmail);
    }
  }, [signup, signupEmail]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="dark:bg-card-foreground dark:border-none dark:text-secondary">
        <CardHeader className="text-center ">
          <CardTitle className="text-xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={dispatch}>
            <FieldGroup>
              <Field className="dark:text-primary-foreground">
                <FieldLabel htmlFor="email" className="font-bold text-md">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  className="dark:text-white font-bold"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field className="dark:text-primary-foreground">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="font-bold text-md">
                    Password
                  </FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  name="password"
                  minLength={8}
                />
                {errorMessage && (
                  <FieldDescription className="text-red-500 font-bold">
                    {errorMessage}
                  </FieldDescription>
                )}
              </Field>
              <Field className="dark:text-primary-foreground">
                <Button
                  type="submit"
                  className="font-extrabold"
                  aria-disabled={pending}
                >
                  Login
                </Button>
                <FieldDescription className="text-center font-bold dark:text-primary-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="hover:font-extrabold">
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
