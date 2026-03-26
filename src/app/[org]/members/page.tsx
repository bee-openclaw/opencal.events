import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getOrgWithNodes } from "@/lib/actions/nodes";
import { getOrgMembers, addMemberByEmail } from "@/lib/actions/members";
import { getUserHighestRole } from "@/lib/rbac";

export const metadata = { title: "Members" };

const ROLE_COLORS: Record<string, string> = {
  global_admin: "bg-primary/10 text-primary",
  regional_director: "bg-accent/10 text-accent-foreground",
  chapter_president: "bg-chart-3/10 text-chart-5",
  chapter_coordinator: "bg-chart-4/10 text-chart-5",
  member: "bg-muted text-muted-foreground",
  observer: "bg-muted text-muted-foreground",
};

export default async function MembersPage({
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
  const role = await getUserHighestRole(session.user.id!, org.id);
  if (!role || role === "member" || role === "observer") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
      </div>
    );
  }

  const members = await getOrgMembers(org.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" render={<Link href={`/${slug}/dashboard`} />}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Dashboard
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Members</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {members.length} member{members.length !== 1 ? "s" : ""} across the organization
      </p>

      {/* Member List */}
      <div className="mt-8 space-y-2">
        {members.map((m) => (
          <Card key={m.roleId} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              {m.userImage ? (
                <img
                  src={m.userImage}
                  alt={m.userName || ""}
                  className="h-9 w-9 rounded-full"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {m.userName?.charAt(0) || m.userEmail?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.userName || m.userEmail}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.userEmail} · {m.nodeName}
                </p>
              </div>
              <Badge className={`text-xs capitalize ${ROLE_COLORS[m.role] || ""}`}>
                <Shield className="mr-1 h-3 w-3" />
                {m.role.replace("_", " ")}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Member */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">Add Member</h2>
        <Card className="mt-4 border-border/50">
          <CardContent className="p-6">
            <form action={addMemberByEmail} className="space-y-4">
              <input type="hidden" name="orgId" value={org.id} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    User must have an OpenCal account
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="chapter_coordinator">Chapter Coordinator</option>
                    <option value="chapter_president">Chapter President</option>
                    <option value="regional_director">Regional Director</option>
                    <option value="global_admin">Global Admin</option>
                    <option value="observer">Observer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgNodeId">Scope (Chapter/Region)</Label>
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

              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Member
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
