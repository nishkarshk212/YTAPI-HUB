import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ChangelogPage() {
  let entries: Array<{ version: string; title: string; content: string; type: string; createdAt: Date }> = [];
  try {
    entries = await prisma.changelogEntry.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    entries = [
      { version: "1.0.0", title: "Initial Release", type: "feature", content: "Launch of YTAPI Hub platform.", createdAt: new Date() },
    ];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold mb-2">Changelog</h1>
      <p className="text-muted-foreground mb-10">Latest updates and improvements to YTAPI Hub.</p>

      <div className="space-y-6">
        {entries.map((entry) => (
          <Card key={entry.version + entry.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge variant="outline">v{entry.version}</Badge>
                <Badge>{entry.type}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <CardTitle className="mt-2">{entry.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{entry.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
