import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAppUser() {
  const supabaseUser = await getSession();
  if (!supabaseUser?.email) return null;

  // Find or create the app user
  let [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, supabaseUser.email))
    .limit(1);

  if (!appUser) {
    [appUser] = await db
      .insert(users)
      .values({
        email: supabaseUser.email,
        name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.email.split("@")[0],
        image: supabaseUser.user_metadata?.avatar_url || null,
        emailVerified: new Date(),
      })
      .returning();
  }

  return appUser;
}
