export interface Organization {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  logo?: string;
  primaryColor?: string;
  website?: string;
  memberCount?: number;
  chapterCount?: number;
  chapters: Chapter[];
  events: CalendarEvent[];
}

export interface Chapter {
  id: string;
  orgSlug: string;
  name: string;
  region: string;
  city: string;
  timezone: string;
  description?: string;
  memberCount?: number;
}

export interface CalendarEvent {
  id: string;
  orgSlug: string;
  chapterId?: string;
  title: string;
  description: string;
  longDescription?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  type: "global_mandate" | "regional" | "chapter";
  visibility: "public" | "members_only";
  cascadeDown: boolean;
  createdBy: string;
  attendeeCount?: number;
  maxAttendees?: number;
  tags?: string[];
}
