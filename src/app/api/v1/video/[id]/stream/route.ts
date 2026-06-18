import { withApiAuth } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/constants";
import { getStreamUrls } from "@/lib/youtube/client";

export const GET = withApiAuth(async (_request, _context, params) => {
  const videoId = params?.id;
  if (!videoId) return apiError(ERROR_CODES.VALIDATION, { field: "id" });

  try {
    const streams = await getStreamUrls(videoId);
    return apiSuccess({ videoId, streams, count: streams.length });
  } catch {
    return apiError(ERROR_CODES.VIDEO_NOT_FOUND);
  }
});
