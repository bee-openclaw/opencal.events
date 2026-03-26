import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  Settings,
  ChevronRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getAppUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrgWithNodes } from "@/lib/actions/nodes";
import { getOrgEvents } from "@/lib/actions/events";
import { getUserHighestRole } from "@/lib/rbac";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return { title: `Dashboard — ${org}` };
}

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");

  const { org: slug } = await params;
  const data = await getOrgWithNodes(slug);
  if (!data) notFound();

  const { org, nodes } = data;
  const allEvents = await getOrgEvents(org.id);
  const role = await getUserHighestRole(user.id, org.id);

  if (!role) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You don&apos;t have access to this organization.
        </p>
      </div>
    );
  }

  const rootNode = nodes.find((n) => n.level === 0);
  const childNodes = nodes.filter((n) => n.level > 0);
  const upcomingEvents = allEvents
    .filter((e) => e.startTime > new Date())
    .slice(0, 5);
  const globalEvents = allEvents.filter((e) => e.type === "global_mandate");
  const isAdmin = role === "global_admin" || role === "regional_director";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
            <Badge variant="secondary" className="text-xs capitalize">
              {role.replace("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Organization dashboard
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/${slug}/manage`} />}
              >
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                Manage
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/${slug}/members`} />}
              >
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Members
              </Button>
            </>
          )}
          <Button size="sm" render={<Link href={`/${slug}/events/new`} />}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{childNodes.length}</p>
                <p className="text-xs text-muted-foreground">Chapters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allEvents.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-3/10">
                <AlertTriangle className="h-4 w-4 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{globalEvents.length}</p>
                <p className="text-xs text-muted-foreground">Global Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-5/10">
                <Clock className="h-4 w-4 text-chart-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/${slug}/calendar`} />}
            >
              View Calendar
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming events. Create one to get started.
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="border-border/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-xs font-medium uppercase">
                        {event.startTime.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {event.startTime.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {event.type.replace("_", " ")}
                        </Badge>
                        {event.location && <span>{event.location}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Chapters */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chapters</h2>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/${slug}/manage`} />}
              >
                Manage
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {childNodes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chapters yet. Add your first chapter from the Manage page.
              </p>
            ) : (
              childNodes.map((node) => (
                <Card key={node.id} className="border-border/50">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{node.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {node.levelLabel || `Level ${node.level}`}
                        {node.city && ` · ${node.city}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
