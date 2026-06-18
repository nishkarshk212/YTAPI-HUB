export const APP_NAME = process.env.APP_NAME ?? "YTAPI Hub";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  "http://localhost:3000/api/v1";

export const API_KEY_PREFIX = "ytapi_";

export const ERROR_CODES = {
  UNAUTHORIZED: { code: "UNAUTHORIZED", message: "Invalid or missing API key", status: 401 },
  FORBIDDEN: { code: "FORBIDDEN", message: "Insufficient permissions", status: 403 },
  NOT_FOUND: { code: "NOT_FOUND", message: "Resource not found", status: 404 },
  RATE_LIMIT: { code: "RATE_LIMIT_EXCEEDED", message: "Rate limit exceeded", status: 429 },
  QUOTA_EXCEEDED: { code: "QUOTA_EXCEEDED", message: "Daily quota exceeded", status: 429 },
  VALIDATION: { code: "VALIDATION_ERROR", message: "Invalid request parameters", status: 400 },
  INTERNAL: { code: "INTERNAL_ERROR", message: "Internal server error", status: 500 },
  VIDEO_NOT_FOUND: { code: "VIDEO_NOT_FOUND", message: "Video not found or unavailable", status: 404 },
  PLAYLIST_NOT_FOUND: { code: "PLAYLIST_NOT_FOUND", message: "Playlist not found", status: 404 },
} as const;

export const DEFAULT_PLANS = [
  {
    name: "Free",
    slug: "free",
    description: "Perfect for testing and small Telegram bots",
    priceMonthly: 0,
    priceYearly: 0,
    requestsPerDay: 1000,
    requestsPerMinute: 20,
    maxApiKeys: 1,
    features: ["Search & metadata", "Stream URLs (720p max)", "Community support", "1 API key"],
    sortOrder: 0,
  },
  {
    name: "Pro",
    slug: "pro",
    description: "For production Telegram music bots",
    priceMonthly: 1900,
    priceYearly: 19000,
    requestsPerDay: 50000,
    requestsPerMinute: 120,
    maxApiKeys: 5,
    features: [
      "All Free features",
      "HD stream URLs",
      "Lyrics & related content",
      "Webhooks",
      "Priority support",
      "5 API keys",
    ],
    sortOrder: 1,
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "High-volume apps and platforms",
    priceMonthly: 9900,
    priceYearly: 99000,
    requestsPerDay: 500000,
    requestsPerMinute: 600,
    maxApiKeys: 50,
    features: [
      "All Pro features",
      "Custom rate limits",
      "Dedicated support",
      "SLA guarantee",
      "50 API keys",
      "White-label options",
    ],
    sortOrder: 2,
  },
] as const;
