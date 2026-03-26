import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { organizations, orgNodes } from "./organizations";

export type EventType = "global_mandate" | "regional" | "chapter" | "draft";
export type EventVisibility = "public" | "members_only" | "leadership_only";
export type EventStatus = "draft" | "pending_approval" | "published" | "cancelled";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  orgNodeId: uuid("org_node_id")
    .notNull()
    .references(() => orgNodes.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  longDescription: text("long_description"),
  startTime: timestamp("start_time", { withTimezone: true, mode: "date" }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true, mode: "date" }).notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  location: text("location"),
  type: text("type").$type<EventType>().notNull().default("chapter"),
  visibility: text("visibility").$type<EventVisibility>().notNull().default("public"),
  cascadeDown: boolean("cascade_down").default(false).notNull(),
  maxAttendees: integer("max_attendees"),
  tags: text("tags").array(),
  status: text("status").$type<EventStatus>().notNull().default("published"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type RsvpStatus = "going" | "maybe" | "declined";

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").$type<RsvpStatus>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.eventId, table.userId)]
);
