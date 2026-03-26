import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OrgNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Organization not found
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        The organization you&apos;re looking for doesn&apos;t exist or hasn&apos;t been set up yet.
      </p>
      <div className="mt-8">
        <Button render={<Link href="/" />}>Back to Home</Button>
      </div>
    </div>
  );
}
