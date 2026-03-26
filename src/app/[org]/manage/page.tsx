import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getOrgWithNodes, createOrgNode } from "@/lib/actions/nodes";
import { getUserHighestRole } from "@/lib/rbac";

export const metadata = { title: "Manage Organization" };

export default async function ManagePage({
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
  if (role !== "global_admin" && role !== "regional_director") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">You need admin access to manage this organization.</p>
      </div>
    );
  }

  const rootNode = nodes.find((n) => n.level === 0);

  // Build tree structure
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = new Map<string | null, typeof nodes>();
  for (const node of nodes) {
    const parentId = node.parentId;
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId)!.push(node);
  }

  function renderNode(node: (typeof nodes)[0], depth: number) {
    const children = childrenMap.get(node.id) || [];
    return `
      <div key="${node.id}" style="margin-left: ${depth * 24}px">
        ${node.name} (${node.levelLabel || `Level ${node.level}`})
        ${node.city ? ` — ${node.city}` : ""}
      </div>
    `;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" render={<Link href={`/${slug}/dashboard`} />}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Dashboard
        </Button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">
        Manage {org.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add regions, chapters, and manage your organization hierarchy.
      </p>

      {/* Hierarchy Tree */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Organization Hierarchy</h2>
        <div className="mt-4 space-y-2">
          {nodes.map((node) => (
            <Card
              key={node.id}
              className="border-border/50"
              style={{ marginLeft: node.level * 24 }}
            >
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={node.level === 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {node.levelLabel || `Level ${node.level}`}
                  </Badge>
                  <span className="text-sm font-medium">{node.name}</span>
                  {node.city && (
                    <span className="text-xs text-muted-foreground">
                      {node.city}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {node.timezone}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Node Form */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">Add Region or Chapter</h2>
        <Card className="mt-4 border-border/50">
          <CardContent className="p-6">
            <form action={createOrgNode} className="space-y-4">
              <input type="hidden" name="orgId" value={org.id} />

              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Node</Label>
                <select
                  id="parentId"
                  name="parentId"
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {"—".repeat(n.level)} {n.name} ({n.levelLabel || `Level ${n.level}`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., North America, NYC Chapter"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="levelLabel">Type Label</Label>
                  <Input
                    id="levelLabel"
                    name="levelLabel"
                    placeholder="e.g., Region, Chapter, District"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="e.g., New York, NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    placeholder="e.g., America/New_York"
                    defaultValue="UTC"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of this node"
                  rows={2}
                />
              </div>

              <Button type="submit">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Node
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
