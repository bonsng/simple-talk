"use server";

import { User } from "@/types/definitions";
import { sql } from "@vercel/postgres";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { hashPwd } from "@/lib/hash-functions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { unstable_noStore as noStore } from "next/cache";
import { auth } from "@/auth";

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (e) {
    console.error("Failed to fetch user:", e);
    throw new Error("Failed to fetch user.");
  }
}

export async function getUserByName(name: string): Promise<string> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE name=${name}`;
    return user.rows[0].id || "";
  } catch (e) {
    console.error("Failed to fetch user:", e);
    throw new Error("Failed to fetch user.");
  }
}

export async function searchUsersByName(query: string | null) {
  if (!query || query.trim().length === 0) return [];
  try {
    const session = await auth();
    const currentEmail = session?.user?.email;
    const me = await sql`SELECT id FROM users WHERE email = ${currentEmail}`;
    const myId = me.rows[0]?.id;
    const { rows } = await sql<User>`
      SELECT id, name, email
      FROM users
      WHERE
        name ILIKE ${"%" + query + "%"}
        AND email != ${currentEmail}
        AND id NOT IN (
          SELECT CASE
            WHEN requester_id = ${myId} THEN addressee_id
            ELSE requester_id
          END
          FROM friendships
          WHERE (requester_id = ${myId} OR addressee_id = ${myId})
            AND status = 'accepted'
        )
      ORDER BY name ASC
      LIMIT 10;
    `;
    return rows;
  } catch (e) {
    console.error("Failed to search users:", e);
    throw new Error("Failed to search users.");
  }
}

const EmailSchema = z.string();
const PasswordSchema = z
  .string()
  .min(6, { message: "Password must be at least 8 chracters long." });
const NameSchema = z.string().min(1, { message: "Name cannot be empty." });

export async function signUp(
  prevState: string | undefined,
  formData: FormData,
) {
  const emailValidation = EmailSchema.safeParse(formData.get("email"));
  const passwordValidation = PasswordSchema.safeParse(formData.get("password"));
  const nameValidation = NameSchema.safeParse(formData.get("name"));

  if (!emailValidation.success) {
    return emailValidation.error.message;
  }
  if (!passwordValidation.success) {
    return passwordValidation.error.message;
  }
  if (!nameValidation.success) {
    return nameValidation.error.message;
  }

  const email = emailValidation.data;
  const password = passwordValidation.data;
  const name = nameValidation.data;
  const authKey = uuidv4();

  try {
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.rowCount && existingUser.rowCount > 0) {
      return "Email already exists.";
    }

    const hashedPwd = await hashPwd(password);
    await sql`
      INSERT INTO users (name, email, password, auth_key)
      VALUES (${name}, ${email}, ${hashedPwd}, ${authKey})
    `;
  } catch (error) {
    console.error("Database error:", error);
    return "Failed to create user.";
  }

  revalidatePath("/login");
  redirect(`/login?signup=success&email=${email}`);
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function fetchLoggedInUser(email: string) {
  noStore();
  try {
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export async function performLogout() {
  "use server";
  await signOut({ redirectTo: "/" });
}
