"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Dev-only: signs in a user by email without OTP.
 * Creates the user if they don't exist, then generates an OTP
 * via the admin API and returns it for client-side verification.
 */
export async function devSignIn(email: string) {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_AUTH) {
    throw new Error("Dev auth not available");
  }

  // Ensure user exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const exists = existingUsers?.users?.some((u) => u.email === email);

  if (!exists) {
    const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createErr && !createErr.message.includes("already been registered")) {
      throw new Error(createErr.message);
    }
  }

  // Generate a magic link and extract the hashed token
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) throw new Error(error.message);

  // The properties contain the OTP token hash - but we need the raw token
  // Instead, let's use the action_link which contains the token
  const actionLink = data.properties?.action_link;
  if (!actionLink) throw new Error("No action link generated");

  // Extract token_hash from the link
  const url = new URL(actionLink);
  const tokenHash = url.searchParams.get("token");

  if (!tokenHash) throw new Error("No token in link");

  return { tokenHash, type: "magiclink" as const };
}
