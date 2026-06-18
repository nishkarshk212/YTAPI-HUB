import { prisma } from "./prisma";
import { hashApiKey, extractApiKey } from "./api-keys";
import { apiError } from "./api-response";
import { ERROR_CODES } from "./constants";
import type { ApiKey, Plan, User } from "@prisma/client";

export type AuthenticatedContext = {
  apiKey: ApiKey;
  user: User;
  plan: Plan;
};

export async function authenticateApiRequest(request: Request) {
  const rawKey = extractApiKey(request);
  if (!rawKey) {
    return { error: apiError(ERROR_CODES.UNAUTHORIZED) };
  }

  const keyHash = hashApiKey(rawKey);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: { include: { subscription: { include: { plan: true } } } },
      plan: true,
    },
  });

  if (!apiKey || !apiKey.isActive) {
    return { error: apiError(ERROR_CODES.UNAUTHORIZED) };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { error: apiError(ERROR_CODES.UNAUTHORIZED, { reason: "API key expired" }) };
  }

  const plan =
    apiKey.plan ??
    apiKey.user.subscription?.plan ??
    (await prisma.plan.findUnique({ where: { slug: "free" } }));

  if (!plan) {
    return { error: apiError(ERROR_CODES.INTERNAL) };
  }

  const rateCheck = await checkRateLimits(apiKey.id, apiKey.userId, plan);
  if (!rateCheck.ok) {
    return { error: rateCheck.response };
  }

  return {
    context: { apiKey, user: apiKey.user, plan } as AuthenticatedContext,
  };
}

async function checkRateLimits(apiKeyId: string, userId: string, plan: Plan) {
  const now = new Date();
  const minuteAgo = new Date(now.getTime() - 60_000);
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const [minuteCount, dayCount] = await Promise.all([
    prisma.usageLog.count({
      where: { apiKeyId, createdAt: { gte: minuteAgo } },
    }),
    prisma.usageLog.count({
      where: { userId, createdAt: { gte: dayStart } },
    }),
  ]);

  if (minuteCount >= plan.requestsPerMinute) {
    return {
      ok: false as const,
      response: apiError(ERROR_CODES.RATE_LIMIT, {
        limit: plan.requestsPerMinute,
        window: "1 minute",
        retry_after: 60,
      }),
    };
  }

  if (dayCount >= plan.requestsPerDay) {
    return {
      ok: false as const,
      response: apiError(ERROR_CODES.QUOTA_EXCEEDED, {
        limit: plan.requestsPerDay,
        window: "24 hours",
        retry_after: Math.ceil((dayStart.getTime() + 86_400_000 - now.getTime()) / 1000),
      }),
    };
  }

  return { ok: true as const };
}

export async function logApiUsage(
  context: AuthenticatedContext,
  request: Request,
  statusCode: number,
  responseTime: number,
  endpoint: string,
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = request.headers.get("user-agent");

  await Promise.all([
    prisma.usageLog.create({
      data: {
        userId: context.user.id,
        apiKeyId: context.apiKey.id,
        endpoint,
        method: request.method,
        statusCode,
        responseTime,
        ipAddress: ip,
        userAgent,
      },
    }),
    prisma.apiKey.update({
      where: { id: context.apiKey.id },
      data: { lastUsedAt: new Date() },
    }),
  ]);
}

import { withCors, handleCorsPreflightRequest } from "./cors";

export function withApiAuth(
  handler: (
    request: Request,
    context: AuthenticatedContext,
    params?: Record<string, string>,
  ) => Promise<Response>,
) {
  return async (request: Request, segmentData?: { params: Promise<Record<string, string>> }) => {
    const preflight = handleCorsPreflightRequest(request);
    if (preflight) return preflight;

    const start = Date.now();
    const auth = await authenticateApiRequest(request);
    if ("error" in auth && auth.error) {
      return withCors(auth.error, request);
    }

    const params = segmentData?.params ? await segmentData.params : undefined;
    const endpoint = new URL(request.url).pathname;

    try {
      const response = await handler(request, auth.context!, params);
      await logApiUsage(auth.context!, request, response.status, Date.now() - start, endpoint);
      return withCors(response, request);
    } catch (err) {
      console.error("API error:", err);
      const response = apiError(ERROR_CODES.INTERNAL);
      await logApiUsage(auth.context!, request, 500, Date.now() - start, endpoint);
      return withCors(response, request);
    }
  };
}
