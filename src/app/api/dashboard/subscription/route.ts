import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ subscription, plans });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planSlug } = await request.json();
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId: session.user.id },
    update: { planId: plan.id, status: "ACTIVE" },
    create: { userId: session.user.id, planId: plan.id, status: "ACTIVE" },
    include: { plan: true },
  });

  await prisma.apiKey.updateMany({
    where: { userId: session.user.id },
    data: { planId: plan.id },
  });

  return NextResponse.json({
    subscription,
    message: plan.priceMonthly > 0
      ? "Plan upgraded. Payment integration can be connected via Stripe."
      : "Plan updated successfully.",
  });
}
