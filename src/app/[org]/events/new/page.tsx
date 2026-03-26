import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getOrgWithNodes } from "@/lib/actions/nodes";
import { createEvent } from "@/lib/actions/events";

export const metadata = { title: "New Event" };

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { org: slug } = await params;
  const data = await getOrgWithNodes(slug);
  if (!data) notFound();

  const { org, nodes } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" render={<Link href={`/${slug}/dashboard`} />}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Dashboard
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a new event for {org.name}
      </p>

      <Card className="mt-8 border-border/50">
        <CardContent className="p-6">
          <form action={createEvent} className="space-y-5">
            <input type="hidden" name="orgId" value={org.id} />

            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Annual Gala 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the event"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Full Description</Label>
              <Textarea
                id="longDescription"
                name="longDescription"
                placeholder="Detailed description (shown on event page)"
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Date & Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Date & Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  placeholder="e.g., America/New_York"
                  defaultValue="UTC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Central Park, NYC"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orgNodeId">Scope</Label>
                <select
                  id="orgNodeId"
                  name="orgNodeId"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {"—".repeat(n.level)} {n.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <select
                  id="type"
                  name="type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="chapter">Chapter Event</option>
                  <option value="regional">Regional Event</option>
                  <option value="global_mandate">Global Mandate</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <select
                  id="visibility"
                  name="visibility"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="public">Public</option>
                  <option value="members_only">Members Only</option>
                  <option value="leadership_only">Leadership Only</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Max Attendees</Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cascadeDown"
                name="cascadeDown"
                value="true"
                className="rounded border-input"
              />
              <Label htmlFor="cascadeDown" className="text-sm font-normal">
                Cascade to all child chapters (makes this event visible on all
                descendant calendars)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="e.g., fundraiser, annual, volunteer (comma-separated)"
              />
            </div>

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
