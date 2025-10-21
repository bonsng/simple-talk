import bcrypt from "bcrypt";

export async function hashPwd(pwd: string) {
  return await bcrypt.hash(pwd, 10);
}

export async function comparePwd(pwd: string, cmpPwd: string) {
  return await bcrypt.compare(pwd, cmpPwd);
}
