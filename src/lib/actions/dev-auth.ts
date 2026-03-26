"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Dev-only: generates a magic link for instant sign-in without email delivery.
 * Returns the OTP token directly so the client can verify it.
 */
export async function devSignIn(email: string) {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_DEV_AUTH) {
    throw new Error("Dev auth not available");
  }

  // Generate OTP via admin API
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { data: {} },
  });

  if (error) throw new Error(error.message);

  // Extract the OTP token from the generated link
  const url = new URL(data.properties.action_link);
  const token = url.searchParams.get("token");

  if (!token) throw new Error("Failed to generate token");

  return { token };
}
