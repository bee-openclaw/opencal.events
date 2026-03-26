"use server";

import { db } from "@/db";
import { userRoles, users, orgNodes, organizations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/db/schema/organizations";

export async function getOrgMembers(orgId: string) {
  const roles = await db
    .select({
      roleId: userRoles.id,
      userId: userRoles.userId,
      orgNodeId: userRoles.orgNodeId,
      role: userRoles.role,
      userName: users.name,
      userEmail: users.email,
      userImage: users.image,
      nodeName: orgNodes.name,
      nodeLevel: orgNodes.level,
    })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .innerJoin(orgNodes, eq(userRoles.orgNodeId, orgNodes.id))
    .where(eq(userRoles.orgId, orgId));

  return roles;
}

export async function addMemberByEmail(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const email = formData.get("email") as string;
  const orgId = formData.get("orgId") as string;
  const orgNodeId = formData.get("orgNodeId") as string;
  const role = formData.get("role") as UserRole;

  if (!email || !orgId || !orgNodeId || !role) {
    throw new Error("Missing required fields");
  }

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("User not found. They need to sign up first.");
  }

  // Check if role already exists
  const existing = await db
    .select()
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, user.id),
        eq(userRoles.orgNodeId, orgNodeId),
        eq(userRoles.role, role)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User already has this role");
  }

  await db.insert(userRoles).values({
    userId: user.id,
    orgId,
    orgNodeId,
    role,
  });

  const [org] = await db
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (org) {
    revalidatePath(`/${org.slug}/members`);
  }
}

export async function removeMember(roleId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(userRoles).where(eq(userRoles.id, roleId));
}

export async function updateMemberRole(roleId: string, newRole: UserRole) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(userRoles)
    .set({ role: newRole })
    .where(eq(userRoles.id, roleId));
}
