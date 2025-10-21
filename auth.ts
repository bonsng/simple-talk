import NextAuth, { type User } from "next-auth";
import Credentials from "@auth/core/providers/credentials";
import { ZodError } from "zod";
import { signInSchema } from "@/lib/zod";
import { getUser } from "@/backend/account-action";
import { comparePwd } from "@/lib/hash-functions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "email" },
        password: { label: "password", type: "password" },
      },
      authorize: async (credentials): Promise<User | null> => {
        try {
          const { email, password } =
            await signInSchema.parseAsync(credentials);
          const user = await getUser(email);
          if (!user) return null;

          const pwdMatch = await comparePwd(password, user.password);
          if (!pwdMatch) return null;

          const { ...safeUser } = user;
          return safeUser as unknown as User;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
          return null;
        }
      },
    }),
  ],
});
