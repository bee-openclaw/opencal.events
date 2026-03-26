import { Organization } from "@/lib/types";

export const organizations: Organization[] = [
  {
    slug: "global-builders",
    name: "Global Builders Alliance",
    description:
      "Building sustainable communities worldwide through local action and global coordination.",
    longDescription:
      "Global Builders Alliance is an international non-profit with over 500 chapters in 45 countries. We coordinate volunteer-led construction projects, disaster relief efforts, and community development programs. Our chapters operate independently but unite around shared campaigns and annual events.",
    memberCount: 12400,
    chapterCount: 524,
    chapters: [
      {
        id: "gb-nyc",
        orgSlug: "global-builders",
        name: "New York City",
        region: "North America",
        city: "New York, NY",
        timezone: "America/New_York",
        description: "Serving the five boroughs since 1998.",
        memberCount: 340,
      },
      {
        id: "gb-london",
        orgSlug: "global-builders",
        name: "London",
        region: "Europe",
        city: "London, UK",
        timezone: "Europe/London",
        description: "Our largest European chapter.",
        memberCount: 280,
      },
      {
        id: "gb-nairobi",
        orgSlug: "global-builders",
        name: "Nairobi",
        region: "Africa",
        city: "Nairobi, Kenya",
        timezone: "Africa/Nairobi",
        description: "Leading community development across East Africa.",
        memberCount: 195,
      },
      {
        id: "gb-tokyo",
        orgSlug: "global-builders",
        name: "Tokyo",
        region: "Asia-Pacific",
        city: "Tokyo, Japan",
        timezone: "Asia/Tokyo",
        description: "Disaster preparedness and community resilience.",
        memberCount: 150,
      },
    ],
    events: [
      {
        id: "gb-global-build-day",
        orgSlug: "global-builders",
        title: "Global Build Day 2026",
        description:
          "Our flagship annual event — every chapter builds simultaneously around the world.",
        longDescription:
          "Global Build Day is our largest coordinated effort of the year. Every chapter organizes a local build project, and we livestream progress from sites around the world. Last year, 8,400 volunteers participated across 380 sites in 42 countries.",
        startTime: "2026-06-15T09:00:00Z",
        endTime: "2026-06-15T17:00:00Z",
        timezone: "UTC",
        type: "global_mandate",
        visibility: "public",
        cascadeDown: true,
        createdBy: "HQ",
        attendeeCount: 8400,
        tags: ["flagship", "annual", "volunteer"],
      },
      {
        id: "gb-leadership-summit",
        orgSlug: "global-builders",
        title: "Chapter Leadership Summit",
        description:
          "Annual gathering of chapter presidents and regional directors.",
        startTime: "2026-09-20T13:00:00Z",
        endTime: "2026-09-22T18:00:00Z",
        timezone: "America/New_York",
        location: "New York, NY",
        type: "global_mandate",
        visibility: "members_only",
        cascadeDown: true,
        createdBy: "HQ",
        attendeeCount: 320,
        maxAttendees: 400,
        tags: ["leadership", "annual"],
      },
      {
        id: "gb-nyc-food-drive",
        orgSlug: "global-builders",
        chapterId: "gb-nyc",
        title: "NYC Spring Food Drive",
        description: "Collecting and distributing food across Manhattan and Brooklyn.",
        startTime: "2026-04-12T08:00:00Z",
        endTime: "2026-04-12T16:00:00Z",
        timezone: "America/New_York",
        location: "Central Park West, New York",
        type: "chapter",
        visibility: "public",
        cascadeDown: false,
        createdBy: "NYC Chapter",
        attendeeCount: 85,
        tags: ["food-drive", "community"],
      },
      {
        id: "gb-london-workshop",
        orgSlug: "global-builders",
        chapterId: "gb-london",
        title: "Sustainable Building Workshop",
        description:
          "Hands-on workshop on eco-friendly construction techniques.",
        startTime: "2026-05-03T10:00:00Z",
        endTime: "2026-05-03T16:00:00Z",
        timezone: "Europe/London",
        location: "Southbank Centre, London",
        type: "chapter",
        visibility: "public",
        cascadeDown: false,
        createdBy: "London Chapter",
        attendeeCount: 45,
        maxAttendees: 60,
        tags: ["workshop", "sustainability"],
      },
    ],
  },
  {
    slug: "youth-leaders",
    name: "Youth Leaders International",
    description:
      "Empowering the next generation of leaders through mentorship, service, and global exchange.",
    longDescription:
      "Youth Leaders International connects young people aged 15-25 with mentorship, leadership training, and cross-cultural exchange programs. With chapters in 30 countries, we run local workshops, regional conferences, and a flagship Global Youth Summit each year.",
    memberCount: 8200,
    chapterCount: 310,
    chapters: [
      {
        id: "yl-sf",
        orgSlug: "youth-leaders",
        name: "San Francisco Bay Area",
        region: "North America",
        city: "San Francisco, CA",
        timezone: "America/Los_Angeles",
        memberCount: 220,
      },
      {
        id: "yl-berlin",
        orgSlug: "youth-leaders",
        name: "Berlin",
        region: "Europe",
        city: "Berlin, Germany",
        timezone: "Europe/Berlin",
        memberCount: 175,
      },
      {
        id: "yl-mumbai",
        orgSlug: "youth-leaders",
        name: "Mumbai",
        region: "Asia-Pacific",
        city: "Mumbai, India",
        timezone: "Asia/Kolkata",
        memberCount: 290,
      },
    ],
    events: [
      {
        id: "yl-global-summit",
        orgSlug: "youth-leaders",
        title: "Global Youth Summit 2026",
        description:
          "Three days of workshops, speakers, and cultural exchange for young leaders worldwide.",
        longDescription:
          "The Global Youth Summit brings together 2,000+ young leaders from every continent for keynote speeches, skill-building workshops, a hackathon, and cultural nights. This year's theme: 'Lead With Purpose.'",
        startTime: "2026-08-10T09:00:00Z",
        endTime: "2026-08-12T18:00:00Z",
        timezone: "Europe/Berlin",
        location: "Berlin, Germany",
        type: "global_mandate",
        visibility: "public",
        cascadeDown: true,
        createdBy: "HQ",
        attendeeCount: 2100,
        tags: ["summit", "annual", "flagship"],
      },
      {
        id: "yl-sf-mentorship-kickoff",
        orgSlug: "youth-leaders",
        chapterId: "yl-sf",
        title: "Spring Mentorship Kickoff",
        description: "Launch of the spring mentorship cohort — pairing mentors with mentees.",
        startTime: "2026-04-05T18:00:00Z",
        endTime: "2026-04-05T20:00:00Z",
        timezone: "America/Los_Angeles",
        location: "Mission District Community Center, SF",
        type: "chapter",
        visibility: "public",
        cascadeDown: false,
        createdBy: "SF Chapter",
        attendeeCount: 60,
        tags: ["mentorship", "kickoff"],
      },
    ],
  },
  {
    slug: "ocean-guardians",
    name: "Ocean Guardians Network",
    description:
      "Protecting marine ecosystems through coastal cleanups, advocacy, and scientific research.",
    longDescription:
      "Ocean Guardians Network is a grassroots environmental organization dedicated to ocean conservation. Our chapters organize coastal cleanups, coral reef monitoring, marine education programs, and policy advocacy campaigns.",
    memberCount: 5600,
    chapterCount: 180,
    chapters: [
      {
        id: "og-sydney",
        orgSlug: "ocean-guardians",
        name: "Sydney",
        region: "Asia-Pacific",
        city: "Sydney, Australia",
        timezone: "Australia/Sydney",
        memberCount: 310,
      },
      {
        id: "og-rio",
        orgSlug: "ocean-guardians",
        name: "Rio de Janeiro",
        region: "South America",
        city: "Rio de Janeiro, Brazil",
        timezone: "America/Sao_Paulo",
        memberCount: 185,
      },
    ],
    events: [
      {
        id: "og-world-ocean-day",
        orgSlug: "ocean-guardians",
        title: "World Ocean Day Cleanup",
        description:
          "Coordinated global beach cleanup on World Ocean Day — every chapter participates.",
        startTime: "2026-06-08T08:00:00Z",
        endTime: "2026-06-08T14:00:00Z",
        timezone: "UTC",
        type: "global_mandate",
        visibility: "public",
        cascadeDown: true,
        createdBy: "HQ",
        attendeeCount: 4200,
        tags: ["cleanup", "annual", "flagship"],
      },
    ],
  },
];

export function getOrganization(slug: string): Organization | undefined {
  return organizations.find((org) => org.slug === slug);
}

export function getEvent(
  orgSlug: string,
  eventId: string
): { org: Organization; event: Organization["events"][number] } | undefined {
  const org = getOrganization(orgSlug);
  if (!org) return undefined;
  const event = org.events.find((e) => e.id === eventId);
  if (!event) return undefined;
  return { org, event };
}
