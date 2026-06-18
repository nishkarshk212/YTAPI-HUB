import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-keys";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
    if (!freePlan) {
      return NextResponse.json({ error: "System not configured" }, { status: 503 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { key, hash, prefix } = generateApiKey();

    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? email.split("@")[0],
        passwordHash,
        subscription: {
          create: { planId: freePlan.id, status: "ACTIVE" },
        },
        apiKeys: {
          create: {
            name: "Default Key",
            keyHash: hash,
            keyPrefix: prefix,
            planId: freePlan.id,
          },
        },
      },
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      apiKey: key,
      message: "Save your API key — it won't be shown again.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
