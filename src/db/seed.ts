import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // Create a demo user
  const [user] = await db
    .insert(schema.users)
    .values({
      name: "Demo Admin",
      email: "demo@opencal.events",
      emailVerified: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    console.log("Demo user already exists, skipping seed.");
    await client.end();
    return;
  }

  // Create organizations
  const [globalBuilders] = await db
    .insert(schema.organizations)
    .values({
      slug: "global-builders",
      name: "Global Builders Alliance",
      description:
        "Building sustainable communities worldwide through local action and global coordination.",
      settings: {
        defaultTimezone: "UTC",
        levelLabels: ["Headquarters", "Region", "Chapter"],
      },
      createdBy: user.id,
    })
    .returning();

  // Create org hierarchy
  const [hq] = await db
    .insert(schema.orgNodes)
    .values({
      orgId: globalBuilders.id,
      name: "Global Builders Alliance",
      slug: "hq",
      level: 0,
      levelLabel: "Headquarters",
      timezone: "UTC",
    })
    .returning();

  await db
    .update(schema.orgNodes)
    .set({ materializedPath: `/${hq.id}/` })
    .where(eq(schema.orgNodes.id, hq.id));

  // Regions
  const regions = await db
    .insert(schema.orgNodes)
    .values([
      {
        orgId: globalBuilders.id,
        parentId: hq.id,
        name: "North America",
        slug: "north-america",
        level: 1,
        levelLabel: "Region",
        timezone: "America/New_York",
      },
      {
        orgId: globalBuilders.id,
        parentId: hq.id,
        name: "Europe",
        slug: "europe",
        level: 1,
        levelLabel: "Region",
        timezone: "Europe/London",
      },
      {
        orgId: globalBuilders.id,
        parentId: hq.id,
        name: "Africa",
        slug: "africa",
        level: 1,
        levelLabel: "Region",
        timezone: "Africa/Nairobi",
      },
    ])
    .returning();

  // Update materialized paths for regions
  for (const region of regions) {
    await db
      .update(schema.orgNodes)
      .set({ materializedPath: `/${hq.id}/${region.id}/` })
      .where(eq(schema.orgNodes.id, region.id));
  }

  const northAmerica = regions[0];
  const europe = regions[1];

  // Chapters
  const chapters = await db
    .insert(schema.orgNodes)
    .values([
      {
        orgId: globalBuilders.id,
        parentId: northAmerica.id,
        name: "New York City",
        slug: "nyc",
        level: 2,
        levelLabel: "Chapter",
        timezone: "America/New_York",
        city: "New York, NY",
        memberCount: 340,
      },
      {
        orgId: globalBuilders.id,
        parentId: northAmerica.id,
        name: "San Francisco",
        slug: "sf",
        level: 2,
        levelLabel: "Chapter",
        timezone: "America/Los_Angeles",
        city: "San Francisco, CA",
        memberCount: 210,
      },
      {
        orgId: globalBuilders.id,
        parentId: europe.id,
        name: "London",
        slug: "london",
        level: 2,
        levelLabel: "Chapter",
        timezone: "Europe/London",
        city: "London, UK",
        memberCount: 280,
      },
    ])
    .returning();

  // Update materialized paths for chapters
  for (const chapter of chapters) {
    const parent = regions.find((r) => r.id === chapter.parentId);
    if (parent) {
      await db
        .update(schema.orgNodes)
        .set({
          materializedPath: `/${hq.id}/${parent.id}/${chapter.id}/`,
        })
        .where(eq(schema.orgNodes.id, chapter.id));
    }
  }

  // Assign user as global admin
  await db.insert(schema.userRoles).values({
    userId: user.id,
    orgId: globalBuilders.id,
    orgNodeId: hq.id,
    role: "global_admin",
  });

  // Create events
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const twoMonths = new Date(now);
  twoMonths.setMonth(twoMonths.getMonth() + 2);

  await db.insert(schema.events).values([
    {
      orgId: globalBuilders.id,
      orgNodeId: hq.id,
      createdBy: user.id,
      title: "Global Build Day 2026",
      description:
        "Our flagship annual event — every chapter builds simultaneously.",
      longDescription:
        "Global Build Day is our largest coordinated effort of the year. Every chapter organizes a local build project.",
      startTime: new Date(`${now.getFullYear()}-06-15T09:00:00Z`),
      endTime: new Date(`${now.getFullYear()}-06-15T17:00:00Z`),
      timezone: "UTC",
      type: "global_mandate",
      visibility: "public",
      cascadeDown: true,
      tags: ["flagship", "annual", "volunteer"],
    },
    {
      orgId: globalBuilders.id,
      orgNodeId: hq.id,
      createdBy: user.id,
      title: "Leadership Summit",
      description: "Annual gathering of chapter presidents and regional directors.",
      startTime: new Date(`${now.getFullYear()}-09-20T13:00:00Z`),
      endTime: new Date(`${now.getFullYear()}-09-22T18:00:00Z`),
      timezone: "America/New_York",
      location: "New York, NY",
      type: "global_mandate",
      visibility: "members_only",
      cascadeDown: true,
      maxAttendees: 400,
      tags: ["leadership", "annual"],
    },
    {
      orgId: globalBuilders.id,
      orgNodeId: chapters[0].id, // NYC
      createdBy: user.id,
      title: "NYC Spring Food Drive",
      description: "Collecting and distributing food across Manhattan and Brooklyn.",
      startTime: nextMonth,
      endTime: new Date(nextMonth.getTime() + 8 * 60 * 60 * 1000),
      timezone: "America/New_York",
      location: "Central Park West, New York",
      type: "chapter",
      visibility: "public",
      cascadeDown: false,
      tags: ["food-drive", "community"],
    },
    {
      orgId: globalBuilders.id,
      orgNodeId: chapters[2].id, // London
      createdBy: user.id,
      title: "Sustainable Building Workshop",
      description: "Hands-on workshop on eco-friendly construction techniques.",
      startTime: twoMonths,
      endTime: new Date(twoMonths.getTime() + 6 * 60 * 60 * 1000),
      timezone: "Europe/London",
      location: "Southbank Centre, London",
      type: "chapter",
      visibility: "public",
      cascadeDown: false,
      maxAttendees: 60,
      tags: ["workshop", "sustainability"],
    },
    {
      orgId: globalBuilders.id,
      orgNodeId: northAmerica.id,
      createdBy: user.id,
      title: "North America Regional Conference",
      description: "Annual conference for all North American chapters.",
      startTime: new Date(`${now.getFullYear()}-07-10T09:00:00Z`),
      endTime: new Date(`${now.getFullYear()}-07-12T17:00:00Z`),
      timezone: "America/Chicago",
      location: "Chicago, IL",
      type: "regional",
      visibility: "public",
      cascadeDown: true,
      maxAttendees: 200,
      tags: ["conference", "regional"],
    },
  ]);

  console.log("Seed complete!");
  console.log(`- Created user: ${user.email}`);
  console.log(`- Created org: ${globalBuilders.name} (/${globalBuilders.slug})`);
  console.log(`- Created ${regions.length} regions, ${chapters.length} chapters`);
  console.log(`- Created 5 events`);

  await client.end();
}

seed().catch(console.error);
