import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { userId: session.user.id },
    select: { id: true, url: true, events: true, isActive: true, createdAt: true },
  });

  return NextResponse.json({ webhooks });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, events } = await request.json();
  if (!url || !events?.length) {
    return NextResponse.json({ error: "URL and events required" }, { status: 400 });
  }

  const secret = randomBytes(32).toString("hex");
  const webhook = await prisma.webhook.create({
    data: {
      userId: session.user.id,
      url,
      secret,
      events,
    },
  });

  return NextResponse.json({ webhook: { id: webhook.id, url, events, secret } });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  await prisma.webhook.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
