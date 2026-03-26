import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createOrganization } from "@/lib/actions/org";

export const metadata = { title: "Create Organization" };

export default async function CreateOrgPage() {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Create Organization
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set up your organization. You&apos;ll be the global admin.
      </p>

      <Card className="mt-8 border-border/50">
        <CardContent className="p-6">
          <form action={createOrganization} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Rotary International"
                required
                minLength={2}
              />
              <p className="text-xs text-muted-foreground">
                This will also generate your URL: opencal.events/your-org-name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What does your organization do?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Input
                id="timezone"
                name="timezone"
                placeholder="e.g., America/New_York"
                defaultValue="UTC"
              />
            </div>

            <Button type="submit" className="w-full">
              Create Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
