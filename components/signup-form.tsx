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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
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
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name" className="font-extrabold">
                User Name
              </FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email" className="font-extrabold">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
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
              <Input id="password" type="password" required />
              <FieldDescription className="font-bold">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password" className="font-extrabold">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription className="font-bold">
                Please confirm your password.
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
