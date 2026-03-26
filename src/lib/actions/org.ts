"use server";

import { db } from "@/db";
import { organizations, orgNodes, userRoles } from "@/db/schema";
import { getAppUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createOrganization(formData: FormData) {
  const user = await getAppUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const timezone = (formData.get("timezone") as string) || "UTC";
  const slug = slugify(name);

  if (!name || name.length < 2) throw new Error("Name is required");

  // Check slug uniqueness
  const existing = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .limit(1);

  if (existing.length > 0) throw new Error("An organization with a similar name already exists");

  // Create org
  const [org] = await db
    .insert(organizations)
    .values({
      name,
      slug,
      description,
      settings: { defaultTimezone: timezone, levelLabels: ["Headquarters", "Region", "Chapter"] },
      createdBy: user.id,
    })
    .returning();

  // Create root node (HQ)
  const [rootNode] = await db
    .insert(orgNodes)
    .values({
      orgId: org.id,
      name: name,
      slug: "hq",
      level: 0,
      levelLabel: "Headquarters",
      timezone,
    })
    .returning();

  // Update materialized path
  await db
    .update(orgNodes)
    .set({ materializedPath: `/${rootNode.id}/` })
    .where(eq(orgNodes.id, rootNode.id));

  // Assign creator as global_admin
  await db.insert(userRoles).values({
    userId: user.id,
    orgId: org.id,
    orgNodeId: rootNode.id,
    role: "global_admin",
  });

  redirect(`/${slug}/dashboard`);
}

export async function updateOrganization(orgId: string, formData: FormData) {
  const user = await getAppUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const [org] = await db
    .update(organizations)
    .set({
      name,
      description,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId))
    .returning();

  revalidatePath(`/${org.slug}`);
  revalidatePath(`/${org.slug}/settings`);
}

export async function getMyOrganizations() {
  const user = await getAppUser();
  if (!user) return [];

  const roles = await db
    .select({
      orgId: userRoles.orgId,
      role: userRoles.role,
    })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));

  if (roles.length === 0) return [];

  const orgIds = [...new Set(roles.map((r) => r.orgId))];
  const orgs = await Promise.all(
    orgIds.map(async (id) => {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, id))
        .limit(1);
      const highestRole = roles
        .filter((r) => r.orgId === id)
        .sort((a, b) => {
          const hierarchy: Record<string, number> = {
            global_admin: 100,
            regional_director: 80,
            chapter_president: 60,
            chapter_coordinator: 40,
            member: 20,
            observer: 10,
          };
          return (hierarchy[b.role] || 0) - (hierarchy[a.role] || 0);
        })[0];
      return org ? { ...org, myRole: highestRole.role } : null;
    })
  );

  return orgs.filter(Boolean);
}
