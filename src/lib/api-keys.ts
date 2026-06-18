import { createHash, randomBytes } from "crypto";
import { API_KEY_PREFIX } from "./constants";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const random = randomBytes(24).toString("hex");
  const key = `${API_KEY_PREFIX}${random}`;
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function extractApiKey(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const headerKey = request.headers.get("x-api-key");
  if (headerKey) return headerKey.trim();
  const url = new URL(request.url);
  return url.searchParams.get("api_key");
}
