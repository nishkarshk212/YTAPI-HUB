"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type UsageData = {
  today: number;
  dailyLimit: number;
  minuteLimit: number;
  dailyUsage: { date: string; count: number }[];
  topEndpoints: { endpoint: string; count: number }[];
};

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/usage")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-muted-foreground">Loading usage data...</p>;

  const pct = Math.round((data.today / data.dailyLimit) * 100);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usage Statistics</h1>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.today.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Daily Limit</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{data.dailyLimit.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Usage</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pct}%</p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>7-Day Usage</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Top Endpoints (7 days)</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.topEndpoints.map((ep) => (
              <li key={ep.endpoint} className="flex justify-between text-sm">
                <code>{ep.endpoint}</code>
                <span className="text-muted-foreground">{ep.count.toLocaleString()} requests</span>
              </li>
            ))}
            {!data.topEndpoints.length && <p className="text-muted-foreground text-sm">No usage yet.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
