"use server";

import { db } from "@/db";
import { events, rsvps, orgNodes, organizations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, gte, lte, sql, or, ne, desc, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const orgNodeId = formData.get("orgNodeId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const longDescription = formData.get("longDescription") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const timezone = (formData.get("timezone") as string) || "UTC";
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const visibility = formData.get("visibility") as string;
  const cascadeDown = formData.get("cascadeDown") === "true";
  const maxAttendees = formData.get("maxAttendees") as string;
  const tagsStr = formData.get("tags") as string;

  if (!title || !startTime || !endTime || !orgId || !orgNodeId) {
    throw new Error("Missing required fields");
  }

  const [event] = await db
    .insert(events)
    .values({
      orgId,
      orgNodeId,
      createdBy: session.user.id,
      title,
      description,
      longDescription: longDescription || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      timezone,
      location: location || null,
      type: (type as any) || "chapter",
      visibility: (visibility as any) || "public",
      cascadeDown,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()) : null,
      status: "published",
    })
    .returning();

  const [org] = await db
    .select({ slug: organizations.slug })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (org) {
    revalidatePath(`/${org.slug}/dashboard`);
    revalidatePath(`/${org.slug}`);
    redirect(`/${org.slug}/dashboard`);
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const longDescription = formData.get("longDescription") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const timezone = formData.get("timezone") as string;
  const location = formData.get("location") as string;
  const type = formData.get("type") as string;
  const visibility = formData.get("visibility") as string;
  const cascadeDown = formData.get("cascadeDown") === "true";
  const maxAttendees = formData.get("maxAttendees") as string;

  await db
    .update(events)
    .set({
      title,
      description,
      longDescription: longDescription || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      timezone,
      location: location || null,
      type: type as any,
      visibility: visibility as any,
      cascadeDown,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId));
}

export async function deleteEvent(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(events).where(eq(events.id, eventId));
}

export async function getEventsForNode(orgId: string, orgNodeId: string) {
  // Get the node to check its path
  const [node] = await db
    .select()
    .from(orgNodes)
    .where(eq(orgNodes.id, orgNodeId))
    .limit(1);

  if (!node) return [];

  // Get direct events for this node
  const directEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.orgId, orgId),
        eq(events.orgNodeId, orgNodeId),
        eq(events.status, "published")
      )
    )
    .orderBy(asc(events.startTime));

  // Get cascaded events from ancestor nodes
  // Find ancestor node IDs from materialized path
  const pathParts = node.materializedPath
    .split("/")
    .filter((p) => p.length > 0 && p !== node.id);

  let cascadedEvents: typeof directEvents = [];
  if (pathParts.length > 0) {
    cascadedEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.orgId, orgId),
          inArray(events.orgNodeId, pathParts),
          eq(events.cascadeDown, true),
          eq(events.status, "published")
        )
      )
      .orderBy(asc(events.startTime));
  }

  return [...cascadedEvents, ...directEvents].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );
}

export async function getOrgEvents(orgId: string) {
  return db
    .select()
    .from(events)
    .where(and(eq(events.orgId, orgId), eq(events.status, "published")))
    .orderBy(asc(events.startTime));
}

export async function detectConflicts(
  orgId: string,
  orgNodeId: string,
  startTime: Date,
  endTime: Date,
  excludeEventId?: string
) {
  // Get the node to find siblings (same parent)
  const [node] = await db
    .select()
    .from(orgNodes)
    .where(eq(orgNodes.id, orgNodeId))
    .limit(1);

  if (!node || !node.parentId) return [];

  // Get sibling nodes (same parent, different id)
  const siblings = await db
    .select()
    .from(orgNodes)
    .where(
      and(eq(orgNodes.parentId, node.parentId), ne(orgNodes.id, orgNodeId))
    );

  if (siblings.length === 0) return [];

  const siblingIds = siblings.map((s) => s.id);

  // Find overlapping events in sibling nodes
  let query = db
    .select({
      event: events,
      nodeName: orgNodes.name,
    })
    .from(events)
    .innerJoin(orgNodes, eq(events.orgNodeId, orgNodes.id))
    .where(
      and(
        eq(events.orgId, orgId),
        inArray(events.orgNodeId, siblingIds),
        eq(events.status, "published"),
        // Overlap check: event starts before our end AND ends after our start
        lte(events.startTime, endTime),
        gte(events.endTime, startTime)
      )
    );

  const conflicts = await query;
  return conflicts.map((c) => ({
    event: c.event,
    chapterName: c.nodeName,
  }));
}

export async function toggleRsvp(eventId: string, status: "going" | "maybe" | "declined") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db
    .select()
    .from(rsvps)
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, session.user.id)))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].status === status) {
      // Toggle off
      await db.delete(rsvps).where(eq(rsvps.id, existing[0].id));
    } else {
      await db
        .update(rsvps)
        .set({ status, updatedAt: new Date() })
        .where(eq(rsvps.id, existing[0].id));
    }
  } else {
    await db.insert(rsvps).values({
      eventId,
      userId: session.user.id,
      status,
    });
  }

  revalidatePath("/");
}

export async function getEventRsvps(eventId: string) {
  return db
    .select()
    .from(rsvps)
    .where(eq(rsvps.eventId, eventId));
}

export async function getMyRsvp(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [rsvp] = await db
    .select()
    .from(rsvps)
    .where(and(eq(rsvps.eventId, eventId), eq(rsvps.userId, session.user.id)))
    .limit(1);

  return rsvp || null;
}
