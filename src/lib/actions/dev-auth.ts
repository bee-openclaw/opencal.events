"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEV_PASSWORD = "opencal-dev-2026";

/**
 * Dev-only: ensures a user exists with a known password for instant sign-in.
 */
export async function devEnsureUser(email: string) {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_AUTH) {
    throw new Error("Dev auth not available");
  }

  // Try to create user with password
  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEV_PASSWORD,
    email_confirm: true,
  });

  // If user already exists, update their password
  if (createErr?.message?.includes("already been registered")) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.users?.find((u) => u.email === email);
    if (existingUser) {
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: DEV_PASSWORD,
      });
    }
  }

  return { password: DEV_PASSWORD };
}
