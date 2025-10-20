"use server";

import { User } from "@/types/definitions";
import { sql } from "@vercel/postgres";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { hashPwd } from "@/lib/hash-functions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (e) {
    console.error("Failed to fetch user:", e);
    throw new Error("Failed to fetch user.");
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
