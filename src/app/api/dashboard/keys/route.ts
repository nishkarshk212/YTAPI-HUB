import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-keys";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
      expiresAt: true,
      plan: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = (body.name as string) || "New API Key";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: { include: { plan: true } }, apiKeys: true },
  });

  if (!user?.subscription?.plan) {
    return NextResponse.json({ error: "No active plan" }, { status: 400 });
  }

  if (user.apiKeys.length >= user.subscription.plan.maxApiKeys) {
    return NextResponse.json(
      { error: `Maximum ${user.subscription.plan.maxApiKeys} API keys for your plan` },
      { status: 403 },
    );
  }

  const { key, hash, prefix } = generateApiKey();
  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      planId: user.subscription.planId,
      name,
      keyHash: hash,
      keyPrefix: prefix,
    },
  });

  return NextResponse.json({
    key: { id: apiKey.id, name: apiKey.name, keyPrefix: prefix },
    secret: key,
    message: "Save this key — it won't be shown again.",
  });
}
