import Link from "next/link";
import {
  Calendar,
  Globe,
  Shield,
  Clock,
  AlertTriangle,
  Users,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { organizations } from "@/data/organizations";

const features = [
  {
    icon: Calendar,
    title: "Hierarchical Calendars",
    description:
      "Every level gets its own calendar — HQ, region, chapter. Events cascade downward automatically.",
  },
  {
    icon: Globe,
    title: "Event Cascade",
    description:
      "Create a global event once. It appears on every chapter's calendar instantly, no manual copying.",
  },
  {
    icon: AlertTriangle,
    title: "Conflict Detection",
    description:
      "Same region, same date? We'll warn you before chapters compete for the same volunteers and donors.",
  },
  {
    icon: Clock,
    title: "Timezone-Aware",
    description:
      "Events stored in UTC, displayed in each viewer's local time. Schedule global town halls with ease.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Permissions follow your org structure. Global admins see everything; chapters manage their own.",
  },
  {
    icon: Users,
    title: "Public Event Pages",
    description:
      "Every org, chapter, and event gets a shareable public page. Boost visibility and attendance.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your organization",
    description:
      "Set up your org, define your hierarchy — regions, districts, chapters. As deep as you need.",
  },
  {
    step: "02",
    title: "Invite your chapters",
    description:
      "Chapter leaders sign up, join their node in the hierarchy, and start managing their own calendars.",
  },
  {
    step: "03",
    title: "Stay in sync",
    description:
      "Global events cascade down. Chapter events roll up into dashboards. Everyone sees what matters.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.08,transparent_70%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 text-sm font-medium"
            >
              Built for non-profits with chapters
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              One calendar for{" "}
              <span className="text-primary">every chapter.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Global events cascade down. Local events roll up. Conflicts
              surface before they happen. Keep every chapter in sync — from HQ to
              the ground.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" render={<Link href="/sign-in" />}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                render={<Link href="/global-builders" />}
              >
                  See Demo Org
                  <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar preview illustration */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-primary/5">
              <div className="flex items-center gap-2 border-b border-border/40 bg-muted/30 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-chart-3/60" />
                <div className="h-3 w-3 rounded-full bg-accent/60" />
                <span className="ml-2 text-xs text-muted-foreground">
                  opencal.events/global-builders
                </span>
              </div>
              <div className="grid gap-3 p-6 sm:grid-cols-3">
                {/* HQ column */}
                <div className="rounded-xl bg-primary/5 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                    HQ — Global
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-xs font-medium text-primary">
                      Global Build Day
                    </div>
                    <div className="rounded-lg bg-primary/10 p-2.5 text-xs font-medium text-primary">
                      Leadership Summit
                    </div>
                  </div>
                </div>
                {/* Region column */}
                <div className="rounded-xl bg-accent/5 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">
                    North America
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-xs font-medium text-primary/70">
                      Global Build Day
                    </div>
                    <div className="rounded-lg bg-accent/10 p-2.5 text-xs font-medium text-accent">
                      Regional Conference
                    </div>
                  </div>
                </div>
                {/* Chapter column */}
                <div className="rounded-xl bg-chart-3/5 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-chart-5">
                    NYC Chapter
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-xs font-medium text-primary/60">
                      Global Build Day
                    </div>
                    <div className="rounded-lg bg-accent/10 p-2.5 text-xs font-medium text-accent/60">
                      Regional Conference
                    </div>
                    <div className="rounded-lg bg-chart-3/10 p-2.5 text-xs font-medium text-chart-5">
                      NYC Food Drive
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for organizations with chapters
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Most calendar tools are built for flat teams. OpenCal is built for
              hierarchies.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-border/50 bg-card transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No complex setup. No IT department required. If your org has
              chapters, OpenCal works for you.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizations showcase */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Explore organizations
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See how organizations use OpenCal to keep their chapters
              coordinated.
            </p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {organizations.map((org) => (
              <Link key={org.slug} href={`/${org.slug}`}>
                <Card className="h-full border-border/50 bg-card transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold">{org.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground line-clamp-2">
                      {org.description}
                    </p>
                    <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
                      <span>{org.chapterCount} chapters</span>
                      <span>&middot;</span>
                      <span>
                        {org.memberCount?.toLocaleString()} members
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to unify your chapters?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Free for non-profits. Set up in minutes. No credit card required.
            </p>
            <div className="mt-8">
              <Button size="lg" render={<Link href="/sign-in" />}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
