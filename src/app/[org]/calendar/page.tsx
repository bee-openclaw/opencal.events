import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrgWithNodes } from "@/lib/actions/nodes";
import { getOrgEvents } from "@/lib/actions/events";
import { getUserHighestRole } from "@/lib/rbac";

export const metadata = { title: "Calendar" };

const TYPE_COLORS: Record<string, string> = {
  global_mandate: "bg-primary/15 text-primary border-primary/20",
  regional: "bg-accent/15 text-accent-foreground border-accent/20",
  chapter: "bg-chart-3/15 text-chart-5 border-chart-3/20",
  draft: "bg-muted text-muted-foreground border-border",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { org: slug } = await params;
  const sp = await searchParams;

  const data = await getOrgWithNodes(slug);
  if (!data) notFound();

  const { org, nodes } = data;
  const role = await getUserHighestRole(session.user.id!, org.id);
  if (!role) notFound();

  const now = new Date();
  const month = sp.month ? parseInt(sp.month) : now.getMonth();
  const year = sp.year ? parseInt(sp.year) : now.getFullYear();

  const allEvents = await getOrgEvents(org.id);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Group events by day
  const eventsByDay = new Map<number, typeof allEvents>();
  for (const event of allEvents) {
    const eventDate = event.startTime;
    if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
      const day = eventDate.getDate();
      if (!eventsByDay.has(day)) eventsByDay.set(day, []);
      eventsByDay.get(day)!.push(event);
    }
  }

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" render={<Link href={`/${slug}/dashboard`} />}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Dashboard
        </Button>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{monthName}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/${slug}/calendar?month=${prevMonth}&year=${prevYear}`} />}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/${slug}/calendar?month=${now.getMonth()}&year=${now.getFullYear()}`} />}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/${slug}/calendar?month=${nextMonth}&year=${nextYear}`} />}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" render={<Link href={`/${slug}/events/new`} />}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
          {days.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-24 border-b border-r border-border/30 bg-muted/10 p-1"
            />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayEvents = eventsByDay.get(day) || [];
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear();

            return (
              <div
                key={day}
                className={`min-h-24 border-b border-r border-border/30 p-1 ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                        TYPE_COLORS[event.type] || TYPE_COLORS.chapter
                      }`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="px-1 text-[10px] text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
          Global Mandate
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-accent/40" />
          Regional
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-chart-3/40" />
          Chapter
        </div>
      </div>
    </div>
  );
}
