import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { DEFAULT_PLANS } from "../src/lib/constants";
import { generateApiKey } from "../src/lib/api-keys";

async function main() {
  for (const plan of DEFAULT_PLANS) {
    const data = { ...plan, features: [...plan.features] };
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: data,
      create: data,
    });
  }

  const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
  if (!freePlan) throw new Error("Free plan not found");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ytapi.dev";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      passwordHash,
      role: "ADMIN",
      subscription: {
        create: {
          planId: freePlan.id,
          status: "ACTIVE",
        },
      },
    },
  });

  const demoEmail = "demo@ytapi.dev";
  const demo = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Developer",
      passwordHash: await bcrypt.hash("demo123456", 12),
      role: "USER",
      subscription: {
        create: {
          planId: freePlan.id,
          status: "ACTIVE",
        },
      },
    },
  });

  const existingKey = await prisma.apiKey.findFirst({ where: { userId: demo.id } });
  if (!existingKey) {
    const { key, hash, prefix } = generateApiKey();
    await prisma.apiKey.create({
      data: {
        userId: demo.id,
        planId: freePlan.id,
        name: "Demo Key",
        keyHash: hash,
        keyPrefix: prefix,
      },
    });
    console.log(`Demo API key (save this): ${key}`);
  }

  const services = [
    { service: "api", status: "operational", description: "REST API v1" },
    { service: "search", status: "operational", description: "Video search" },
    { service: "streaming", status: "operational", description: "Stream URL resolution" },
    { service: "dashboard", status: "operational", description: "Developer dashboard" },
  ];

  for (const s of services) {
    await prisma.systemStatus.upsert({
      where: { service: s.service },
      update: { status: s.status, description: s.description },
      create: s,
    });
  }

  const changelogCount = await prisma.changelogEntry.count();
  if (changelogCount === 0) {
    await prisma.changelogEntry.createMany({
      data: [
        {
          version: "1.0.0",
          title: "Initial Release",
          type: "feature",
          content:
            "Launch of YTAPI Hub with search, video metadata, stream URLs, playlists, lyrics, and Telegram bot integration guides.",
        },
        {
          version: "0.9.0",
          title: "Beta API Explorer",
          type: "feature",
          content: "Interactive API explorer with live request testing and multi-language code samples.",
        },
      ],
    });
  }

  console.log(`Seeded admin: ${adminEmail} / ${adminPassword}`);
  console.log(`Seeded demo: ${demoEmail} / demo123456`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
