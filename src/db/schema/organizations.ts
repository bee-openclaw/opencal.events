import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: text("website"),
  settings: jsonb("settings").$type<{
    defaultTimezone?: string;
    levelLabels?: string[];
  }>(),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const orgNodes = pgTable(
  "org_nodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): any => orgNodes.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    level: integer("level").notNull().default(0),
    levelLabel: text("level_label"),
    timezone: text("timezone").default("UTC").notNull(),
    city: text("city"),
    description: text("description"),
    materializedPath: text("materialized_path").notNull().default("/"),
    memberCount: integer("member_count").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.orgId, table.slug)]
);

export type UserRole =
  | "global_admin"
  | "regional_director"
  | "chapter_president"
  | "chapter_coordinator"
  | "member"
  | "observer";

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    orgNodeId: uuid("org_node_id")
      .notNull()
      .references(() => orgNodes.id, { onDelete: "cascade" }),
    role: text("role").$type<UserRole>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.orgNodeId, table.role)]
);
