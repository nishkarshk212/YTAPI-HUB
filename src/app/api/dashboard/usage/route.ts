import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const today = startOfDay(new Date());
  const weekAgo = subDays(today, 7);

  const [todayCount, weekLogs, endpointStats, plan] = await Promise.all([
    prisma.usageLog.count({ where: { userId, createdAt: { gte: today } } }),
    prisma.usageLog.groupBy({
      by: ["createdAt"],
      where: { userId, createdAt: { gte: weekAgo } },
      _count: true,
    }),
    prisma.usageLog.groupBy({
      by: ["endpoint"],
      where: { userId, createdAt: { gte: weekAgo } },
      _count: true,
      orderBy: { _count: { endpoint: "desc" } },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    }),
  ]);

  const dailyUsage: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    dailyUsage[d.toISOString().split("T")[0]] = 0;
  }

  const logs = await prisma.usageLog.findMany({
    where: { userId, createdAt: { gte: weekAgo } },
    select: { createdAt: true },
  });

  for (const log of logs) {
    const key = startOfDay(log.createdAt).toISOString().split("T")[0];
    if (key in dailyUsage) dailyUsage[key]++;
  }

  return NextResponse.json({
    today: todayCount,
    dailyLimit: plan?.subscription?.plan.requestsPerDay ?? 1000,
    minuteLimit: plan?.subscription?.plan.requestsPerMinute ?? 30,
    dailyUsage: Object.entries(dailyUsage).map(([date, count]) => ({ date, count })),
    topEndpoints: endpointStats.map((e) => ({ endpoint: e.endpoint, count: e._count })),
  });
}
