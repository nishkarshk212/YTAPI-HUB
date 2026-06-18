import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Key, Activity, TrendingUp } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const [users, keys, requests, todayRequests] = await Promise.all([
    prisma.user.count(),
    prisma.apiKey.count({ where: { isActive: true } }),
    prisma.usageLog.count(),
    prisma.usageLog.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
  ]);

  const adminLinks = [
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/keys", label: "API Keys", icon: Key },
    { href: "/admin/plans", label: "Plans & Rate Limits", icon: TrendingUp },
    { href: "/admin/analytics", label: "Analytics", icon: Activity },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{users}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Keys</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{keys}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{requests.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Last 24h</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{todayRequests.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardContent className="flex items-center gap-4 p-6">
                <link.icon className="h-8 w-8 text-primary" />
                <span className="font-semibold">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
