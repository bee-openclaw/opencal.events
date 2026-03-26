"use server";

import { db } from "@/db";
import { orgNodes, organizations } from "@/db/schema";
import { getAppUser } from "@/lib/auth";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getOrgWithNodes(orgSlug: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);

  if (!org) return null;

  const nodes = await db
    .select()
    .from(orgNodes)
    .where(eq(orgNodes.orgId, org.id))
    .orderBy(asc(orgNodes.level), asc(orgNodes.name));

  return { org, nodes };
}

export async function createOrgNode(formData: FormData) {
  const user = await getAppUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const parentId = formData.get("parentId") as string;
  const name = formData.get("name") as string;
  const levelLabel = formData.get("levelLabel") as string;
  const timezone = (formData.get("timezone") as string) || "UTC";
  const city = formData.get("city") as string;
  const description = formData.get("description") as string;

  if (!name || !orgId || !parentId) throw new Error("Missing required fields");

  // Get parent node for level and path
  const [parent] = await db
    .select()
    .from(orgNodes)
    .where(eq(orgNodes.id, parentId))
    .limit(1);

  if (!parent) throw new Error("Parent node not found");

  const slug = slugify(name);
  const level = parent.level + 1;

  const [node] = await db
    .insert(orgNodes)
    .values({
      orgId,
      parentId,
      name,
      slug,
      level,
      levelLabel: levelLabel || (level === 1 ? "Region" : "Chapter"),
      timezone,
      city,
      description,
      materializedPath: parent.materializedPath,
    })
    .returning();

  // Update materialized path to include self
  await db
    .update(orgNodes)
    .set({
      materializedPath: `${parent.materializedPath}${node.id}/`,
    })
    .where(eq(orgNodes.id, node.id));

  // Get org slug for revalidation
  const [org] = await db
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (org) {
    revalidatePath(`/${org.slug}/dashboard`);
    revalidatePath(`/${org.slug}/manage`);
    redirect(`/${org.slug}/manage`);
  }
}

export async function updateOrgNode(nodeId: string, formData: FormData) {
  const user = await getAppUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const timezone = formData.get("timezone") as string;
  const city = formData.get("city") as string;
  const description = formData.get("description") as string;

  const [node] = await db
    .update(orgNodes)
    .set({ name, timezone, city, description, updatedAt: new Date() })
    .where(eq(orgNodes.id, nodeId))
    .returning();

  return node;
}

export async function deleteOrgNode(nodeId: string) {
  const user = await getAppUser();
  if (!user) throw new Error("Unauthorized");

  // Prevent deleting root nodes
  const [node] = await db
    .select()
    .from(orgNodes)
    .where(eq(orgNodes.id, nodeId))
    .limit(1);

  if (!node) throw new Error("Node not found");
  if (node.level === 0) throw new Error("Cannot delete the root node");

  await db.delete(orgNodes).where(eq(orgNodes.id, nodeId));

  const [org] = await db
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, node.orgId))
    .limit(1);

  if (org) {
    revalidatePath(`/${org.slug}/dashboard`);
    revalidatePath(`/${org.slug}/manage`);
  }
}
