import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Globe,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrganization } from "@/data/organizations";

function formatEventDate(startTime: string, timezone: string) {
  const date = new Date(startTime);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEventTime(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} — ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const org = getOrganization(slug);
  if (!org) return { title: "Organization Not Found" };
  return {
    title: org.name,
    description: org.description,
    openGraph: {
      title: `${org.name} | OpenCal`,
      description: org.description,
    },
  };
}

export default async function OrgPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const org = getOrganization(slug);
  if (!org) notFound();

  const globalEvents = org.events.filter((e) => e.type === "global_mandate");
  const chapterEvents = org.events.filter((e) => e.type === "chapter");

  return (
    <>
      {/* Org Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.06,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col items-start gap-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              &larr; All Organizations
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {org.name}
                </h1>
                <p className="mt-1 text-lg text-muted-foreground">
                  {org.description}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {org.memberCount?.toLocaleString()} members
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {org.chapterCount} chapters
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {org.events.length} upcoming events
              </span>
            </div>
          </div>
          {org.longDescription && (
            <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
              {org.longDescription}
            </p>
          )}
        </div>
      </section>

      {/* Global Events */}
      {globalEvents.length > 0 && (
        <section className="bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold tracking-tight">
              Organization-Wide Events
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These events apply to all chapters
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {globalEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/${org.slug}/events/${event.id}`}
                >
                  <Card className="h-full border-primary/20 bg-card transition-all hover:shadow-md hover:border-primary/40">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/15">
                            Global
                          </Badge>
                          <h3 className="text-base font-semibold">
                            {event.title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatEventDate(event.startTime, event.timezone)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatEventTime(event.startTime, event.endTime)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </span>
                        )}
                        {event.attendeeCount && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {event.attendeeCount.toLocaleString()} attending
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chapters */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold tracking-tight">Chapters</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Local chapters around the world
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {org.chapters.map((chapter) => {
              const chapterEventCount = chapterEvents.filter(
                (e) => e.chapterId === chapter.id
              ).length;
              return (
                <Card
                  key={chapter.id}
                  className="border-border/50 bg-card transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold">{chapter.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {chapter.region}
                    </p>
                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      {chapter.memberCount && (
                        <span>{chapter.memberCount} members</span>
                      )}
                      {chapterEventCount > 0 && (
                        <span>{chapterEventCount} events</span>
                      )}
                    </div>
                    {chapter.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {chapter.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chapter Events */}
      {chapterEvents.length > 0 && (
        <section className="border-t border-border/40 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold tracking-tight">Chapter Events</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Events organized by local chapters
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {chapterEvents.map((event) => {
                const chapter = org.chapters.find(
                  (c) => c.id === event.chapterId
                );
                return (
                  <Link
                    key={event.id}
                    href={`/${org.slug}/events/${event.id}`}
                  >
                    <Card className="h-full border-border/50 bg-card transition-all hover:shadow-md hover:border-accent/30">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="bg-accent/10 text-accent-foreground"
                              >
                                {chapter?.name || "Chapter"}
                              </Badge>
                            </div>
                            <h3 className="text-base font-semibold">
                              {event.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatEventDate(event.startTime, event.timezone)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Want to manage calendars like {org.name}?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create your organization on OpenCal for free.
            </p>
            <div className="mt-6">
              <Button render={<Link href="/sign-in" />}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
