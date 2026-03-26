import { db } from "@/db";
import { userRoles, orgNodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { UserRole } from "@/db/schema/organizations";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  global_admin: 100,
  regional_director: 80,
  chapter_president: 60,
  chapter_coordinator: 40,
  member: 20,
  observer: 10,
};

type Action =
  | "org.manage"
  | "org.view"
  | "node.manage"
  | "node.view"
  | "event.create"
  | "event.edit"
  | "event.delete"
  | "event.view"
  | "member.invite"
  | "member.manage"
  | "member.view"
  | "rsvp";

const ACTION_MIN_ROLE: Record<Action, UserRole> = {
  "org.manage": "global_admin",
  "org.view": "observer",
  "node.manage": "regional_director",
  "node.view": "observer",
  "event.create": "chapter_coordinator",
  "event.edit": "chapter_coordinator",
  "event.delete": "chapter_president",
  "event.view": "observer",
  "member.invite": "chapter_president",
  "member.manage": "regional_director",
  "member.view": "member",
  rsvp: "member",
};

export async function getUserRolesForOrg(userId: string, orgId: string) {
  return db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.orgId, orgId)));
}

export async function getUserHighestRole(
  userId: string,
  orgId: string
): Promise<UserRole | null> {
  const roles = await getUserRolesForOrg(userId, orgId);
  if (roles.length === 0) return null;

  return roles.reduce((highest, r) => {
    const role = r.role as UserRole;
    return ROLE_HIERARCHY[role] > ROLE_HIERARCHY[highest] ? role : highest;
  }, roles[0].role as UserRole);
}

export async function checkPermission(
  userId: string,
  orgId: string,
  orgNodeId: string,
  action: Action
): Promise<boolean> {
  const roles = await getUserRolesForOrg(userId, orgId);
  if (roles.length === 0) return false;

  const minRole = ACTION_MIN_ROLE[action];
  const minLevel = ROLE_HIERARCHY[minRole];

  // Check if user has a global_admin role — they can do anything
  const isGlobalAdmin = roles.some((r) => r.role === "global_admin");
  if (isGlobalAdmin) return true;

  // Get the target node to check hierarchy
  const [targetNode] = await db
    .select()
    .from(orgNodes)
    .where(eq(orgNodes.id, orgNodeId))
    .limit(1);

  if (!targetNode) return false;

  // Check each of the user's roles
  for (const userRole of roles) {
    const roleLevel = ROLE_HIERARCHY[userRole.role as UserRole];
    if (roleLevel < minLevel) continue;

    // Check if the user's role node is an ancestor of (or equal to) the target node
    const [roleNode] = await db
      .select()
      .from(orgNodes)
      .where(eq(orgNodes.id, userRole.orgNodeId))
      .limit(1);

    if (!roleNode) continue;

    // Same node — always allowed if role level is sufficient
    if (roleNode.id === targetNode.id) return true;

    // Ancestor check via materialized path
    if (targetNode.materializedPath.startsWith(roleNode.materializedPath + roleNode.id + "/")) {
      return true;
    }
  }

  return false;
}

export async function requireAuth(userId: string | undefined): Promise<string> {
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function requirePermission(
  userId: string,
  orgId: string,
  orgNodeId: string,
  action: Action
) {
  const allowed = await checkPermission(userId, orgId, orgNodeId, action);
  if (!allowed) throw new Error("Forbidden");
}
