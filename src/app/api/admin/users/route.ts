import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      subscription: { include: { plan: true } },
      _count: { select: { apiKeys: true, usageLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role, planSlug } = await request.json();

  if (role) {
    await prisma.user.update({ where: { id: userId }, data: { role } });
  }

  if (planSlug) {
    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (plan) {
      await prisma.subscription.upsert({
        where: { userId },
        update: { planId: plan.id },
        create: { userId, planId: plan.id, status: "ACTIVE" },
      });
    }
  }

  return NextResponse.json({ success: true });
}
