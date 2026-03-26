import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, Users, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyOrganizations } from "@/lib/actions/org";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const orgs = await getMyOrganizations();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        <Button render={<Link href="/create-org" />}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {orgs.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No organizations yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first organization to start managing calendars.
          </p>
          <div className="mt-6">
            <Button render={<Link href="/create-org" />}>
              Create Organization
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org: any) => (
            <Link key={org.id} href={`/${org.slug}/dashboard`}>
              <Card className="h-full border-border/50 transition-all hover:shadow-md hover:border-primary/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="text-base font-semibold">{org.name}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {org.myRole?.replace("_", " ")}
                    </Badge>
                  </div>
                  {org.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {org.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-xs text-primary">
                    Open Dashboard
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
