"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";
import { signUp } from "@/backend/account-action";
import { toast } from "sonner";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [errorMessage, dispatch] = useActionState(signUp, undefined);

  const { pending } = useFormStatus();

  useEffect(() => {
    if (password !== confirmPassword && confirmPassword !== "") {
      setPasswordError("Passwords do not match.");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (errorMessage) {
      toast.error("failed");
    }
  }, [errorMessage]);

  return (
    <Card
      {...props}
      className="dark:bg-card-foreground dark:border-none dark:text-primary-foreground font-bold"
    >
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={dispatch}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name" className="font-extrabold">
                User Name
              </FieldLabel>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="font-extrabold">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldDescription className="font-bold">
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="font-extrabold">
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                name="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <FieldDescription className="font-bold">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword" className="font-extrabold">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                required
                name="confirmPassword"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FieldDescription
                className={clsx("font-bold", {
                  "text-red-500": passwordError,
                })}
              >
                {passwordError
                  ? passwordError
                  : "Please confirm your password."}
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="font-extrabold">
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="font-extrabold"
                  aria-disabled={pending}
                >
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center font-bold">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
