import { withApiAuth } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";
import { ERROR_CODES } from "@/lib/constants";
import { getPlaylist } from "@/lib/youtube/client";

export const GET = withApiAuth(async (_request, _context, params) => {
  const playlistId = params?.id;
  if (!playlistId) return apiError(ERROR_CODES.VALIDATION, { field: "id" });

  const playlist = await getPlaylist(playlistId);
  if (!playlist) return apiError(ERROR_CODES.PLAYLIST_NOT_FOUND);

  return apiSuccess(playlist);
});
