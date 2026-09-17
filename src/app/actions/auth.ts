"use server";

import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabaseClient";

export async function verifyLogin(username: string, password: string) {
  const { data, error } = await supabase
    .from("users")
    .select("username, password_hash")
    .eq("username", username.trim())
    .maybeSingle();

  if (error || !data) {
    return { ok: false, message: "IDまたはパスワードが違います" };
  }

  const isMatch = await bcrypt.compare(password, data.password_hash);

  if (!isMatch) {
    return { ok: false, message: "IDまたはパスワードが違います" };
  }

  return { ok: true, username: data.username };
}
