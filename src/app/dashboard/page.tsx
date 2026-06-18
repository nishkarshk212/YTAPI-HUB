import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/constants";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { startOfDay } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const today = startOfDay(new Date());

  const [user, todayUsage, keyCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } }, apiKeys: { take: 3 } },
    }),
    prisma.usageLog.count({ where: { userId, createdAt: { gte: today } } }),
    prisma.apiKey.count({ where: { userId, isActive: true } }),
  ]);

  const plan = user?.subscription?.plan;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{plan?.name ?? "Free"}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Usage</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{todayUsage.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">/ {plan?.requestsPerDay.toLocaleString() ?? "1,000"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Keys</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{keyCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Rate Limit</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{plan?.requestsPerMinute ?? 30}/min</p></CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>API Base URL</CardTitle></CardHeader>
        <CardContent>
          <code className="block bg-muted rounded-lg p-3 text-sm font-mono">{API_BASE_URL}</code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent API Keys</CardTitle>
          <Link href="/dashboard/keys"><Button size="sm">Manage Keys</Button></Link>
        </CardHeader>
        <CardContent>
          {user?.apiKeys.length ? (
            <ul className="space-y-2">
              {user.apiKeys.map((key) => (
                <li key={key.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{key.keyPrefix}••••••••</p>
                  </div>
                  <Badge variant={key.isActive ? "success" : "outline"}>{key.isActive ? "Active" : "Revoked"}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">No API keys yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
