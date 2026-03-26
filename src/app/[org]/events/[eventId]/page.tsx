import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  ArrowLeft,
  Share2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getEvent } from "@/data/organizations";

function formatEventDate(startTime: string) {
  const date = new Date(startTime);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
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

function formatDuration(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  );
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.round(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ org: string; eventId: string }>;
}) {
  const { org: orgSlug, eventId } = await params;
  const result = getEvent(orgSlug, eventId);
  if (!result) return { title: "Event Not Found" };
  return {
    title: `${result.event.title} — ${result.org.name}`,
    description: result.event.description,
    openGraph: {
      title: `${result.event.title} | ${result.org.name} | OpenCal`,
      description: result.event.description,
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ org: string; eventId: string }>;
}) {
  const { org: orgSlug, eventId } = await params;
  const result = getEvent(orgSlug, eventId);
  if (!result) notFound();

  const { org, event } = result;
  const chapter = event.chapterId
    ? org.chapters.find((c) => c.id === event.chapterId)
    : null;

  const typeLabel =
    event.type === "global_mandate"
      ? "Global Event"
      : event.type === "regional"
        ? "Regional Event"
        : "Chapter Event";

  return (
    <>
      {/* Event Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.06,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/${org.slug}`} className="hover:text-foreground">
              {org.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">Events</span>
          </nav>

          <div className="flex items-start gap-2 mb-4">
            <Badge
              className={
                event.type === "global_mandate"
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "bg-accent/10 text-accent-foreground"
              }
            >
              {typeLabel}
            </Badge>
            {event.visibility === "members_only" && (
              <Badge variant="secondary">Members Only</Badge>
            )}
            {event.cascadeDown && (
              <Badge variant="outline" className="text-xs">
                All Chapters
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {event.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg">RSVP</Button>
            <Button variant="outline" size="lg">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {event.longDescription && (
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold tracking-tight">About This Event</h2>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">
                    {event.longDescription}
                  </p>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div className="mt-8">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Tag className="h-4 w-4" />
                    Tags
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {formatEventDate(event.startTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatEventTime(event.startTime, event.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(event.startTime, event.endTime)} &middot;{" "}
                        {event.timezone}
                      </p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.attendeeCount && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Attendees</p>
                        <p className="text-sm text-muted-foreground">
                          {event.attendeeCount.toLocaleString()} attending
                          {event.maxAttendees &&
                            ` / ${event.maxAttendees.toLocaleString()} max`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Organized by</p>
                      <p className="text-sm text-muted-foreground">
                        {chapter ? chapter.name : org.name}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full" render={<Link href={`/${org.slug}`} />}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to {org.name}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
