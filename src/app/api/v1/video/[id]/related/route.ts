import { z } from "zod";
import { withApiAuth } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/constants";
import { getRelatedVideos } from "@/lib/youtube/client";

const schema = z.object({
  limit: z.coerce.number().min(1).max(25).default(10),
});

export const GET = withApiAuth(async (request, _context, params) => {
  const videoId = params?.id;
  if (!videoId) return apiError(ERROR_CODES.VALIDATION, { field: "id" });

  const url = new URL(request.url);
  const parsed = schema.safeParse({ limit: url.searchParams.get("limit") ?? 10 });
  if (!parsed.success) return apiError(ERROR_CODES.VALIDATION, parsed.error.flatten());

  const videos = await getRelatedVideos(videoId, parsed.data.limit);
  return apiSuccess({ videoId, videos, count: videos.length });
});
