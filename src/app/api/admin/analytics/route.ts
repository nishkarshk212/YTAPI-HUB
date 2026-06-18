import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const weekAgo = subDays(new Date(), 7);

  const [totalUsers, totalKeys, totalRequests, requestsToday, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.apiKey.count({ where: { isActive: true } }),
    prisma.usageLog.count(),
    prisma.usageLog.count({ where: { createdAt: { gte: subDays(new Date(), 1) } } }),
    prisma.usageLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        apiKey: { select: { keyPrefix: true, name: true } },
      },
    }),
  ]);

  const statusCodes = await prisma.usageLog.groupBy({
    by: ["statusCode"],
    where: { createdAt: { gte: weekAgo } },
    _count: true,
  });

  return NextResponse.json({
    stats: { totalUsers, totalKeys, totalRequests, requestsToday },
    statusCodes: statusCodes.map((s) => ({ code: s.statusCode, count: s._count })),
    recentLogs,
  });
}
