import { z } from "zod";
import { withApiAuth } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/constants";
import { searchVideos } from "@/lib/youtube/client";

const schema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const GET = withApiAuth(async (request) => {
  const url = new URL(request.url);
  const parsed = schema.safeParse({
    q: url.searchParams.get("q"),
    limit: url.searchParams.get("limit") ?? 10,
  });

  if (!parsed.success) {
    return apiError(ERROR_CODES.VALIDATION, parsed.error.flatten());
  }

  const results = await searchVideos(parsed.data.q, parsed.data.limit);
  return apiSuccess(results, { query: parsed.data.q, limit: parsed.data.limit });
});
