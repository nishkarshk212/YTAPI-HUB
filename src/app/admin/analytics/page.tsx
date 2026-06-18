"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    stats: { totalUsers: number; totalKeys: number; totalRequests: number; requestsToday: number };
    statusCodes: { code: number; count: number }[];
    recentLogs: Array<{ endpoint: string; statusCode: number; createdAt: string; user: { email: string } }>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="p-8 text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/admin"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {Object.entries(data.stats).map(([key, val]) => (
          <Card key={key}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{val.toLocaleString()}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Status Codes (7 days)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {data.statusCodes.map((s) => (
              <div key={s.code} className="text-sm">
                <span className="font-mono font-bold">{s.code}</span>: {s.count.toLocaleString()}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Requests</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentLogs.map((log, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-border pb-2">
                <div>
                  <code>{log.endpoint}</code>
                  <span className="text-muted-foreground ml-2">{log.user.email}</span>
                </div>
                <div className="text-muted-foreground">
                  {log.statusCode} · {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
