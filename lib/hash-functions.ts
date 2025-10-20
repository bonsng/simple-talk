import bcrypt from "bcrypt";

export async function hashPwd(pwd: string) {
  return await bcrypt.hash(pwd, 10);
}
