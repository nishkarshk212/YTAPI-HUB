import { API_BASE_URL } from "./constants";

export type DocSection = {
  slug: string;
  title: string;
  category: string;
  content: string;
  examples?: CodeExample[];
};

export type CodeExample = {
  lang: "curl" | "javascript" | "python" | "nodejs" | "php";
  label: string;
  code: string;
};

export const DOC_SECTIONS: DocSection[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    category: "Introduction",
    content: `
## Quick Start

YTAPI Hub provides a secure REST API for YouTube search, metadata, stream URLs, playlists, lyrics, and related content — optimized for **Telegram music bots** and public developers.

### Base URL

All API requests use:

\`{{BASE_URL}}\`

### Authentication

Include your API key in every request using one of these methods:

1. **Authorization header** (recommended): \`Authorization: Bearer ytapi_your_key\`
2. **X-API-Key header**: \`X-API-Key: ytapi_your_key\`
3. **Query parameter**: \`?api_key=ytapi_your_key\`

### Response Format

All responses follow a consistent JSON structure:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
\`\`\`

Errors return:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded"
  }
}
\`\`\`
    `.replace("{{BASE_URL}}", API_BASE_URL),
    examples: [
      {
        lang: "curl",
        label: "cURL",
        code: `curl -X GET "${API_BASE_URL}/search?q=lofi+hip+hop&limit=5" \\
  -H "Authorization: Bearer ytapi_your_api_key"`,
      },
      {
        lang: "javascript",
        label: "JavaScript",
        code: `const res = await fetch("${API_BASE_URL}/search?q=lofi+hip+hop", {
  headers: { Authorization: "Bearer ytapi_your_api_key" }
});
const { data } = await res.json();
console.log(data.videos);`,
      },
      {
        lang: "python",
        label: "Python",
        code: `import requests

r = requests.get(
    "${API_BASE_URL}/search",
    params={"q": "lofi hip hop", "limit": 5},
    headers={"Authorization": "Bearer ytapi_your_api_key"}
)
print(r.json()["data"]["videos"])`,
      },
    ],
  },
  {
    slug: "authentication",
    title: "Authentication",
    category: "Introduction",
    content: `
## API Keys

Register at the dashboard to receive your first API key. Keys are prefixed with \`ytapi_\` and shown **only once** at creation.

### Security Best Practices

- Never expose keys in client-side code or public repos
- Use environment variables in your Telegram bot
- Rotate keys periodically from the dashboard
- Revoke compromised keys immediately

### Rate Limits

Limits depend on your plan:

| Plan | Requests/day | Requests/minute |
|------|-------------|-----------------|
| Free | 1,000 | 20 |
| Pro | 50,000 | 120 |
| Enterprise | 500,000 | 600 |

When exceeded, you'll receive HTTP \`429\` with a \`retry_after\` value in the error details.
    `,
  },
  {
    slug: "search",
    title: "Search Videos",
    category: "Endpoints",
    content: `
## GET /search

Search YouTube videos by query string.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| limit | integer | No | Max results (1-50, default 10) |

### Example Response

\`\`\`json
{
  "success": true,
  "data": {
    "videos": [{
      "id": "dQw4w9WgXcQ",
      "title": "Video Title",
      "channel": { "id": "...", "name": "Channel" },
      "duration": 212,
      "thumbnails": [{ "url": "..." }]
    }],
    "totalResults": 10
  }
}
\`\`\`
    `,
    examples: [
      {
        lang: "curl",
        label: "cURL",
        code: `curl "${API_BASE_URL}/search?q=telegram+music+bot&limit=10" \\
  -H "Authorization: Bearer ytapi_your_api_key"`,
      },
      {
        lang: "nodejs",
        label: "Node.js",
        code: `const axios = require("axios");

const { data } = await axios.get("${API_BASE_URL}/search", {
  params: { q: "telegram music bot", limit: 10 },
  headers: { Authorization: "Bearer ytapi_your_api_key" }
});`,
      },
      {
        lang: "php",
        label: "PHP",
        code: `$ch = curl_init("${API_BASE_URL}/search?q=telegram+music+bot");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer ytapi_your_api_key"
]);
$response = json_decode(curl_exec($ch), true);`,
      },
    ],
  },
  {
    slug: "video",
    title: "Video Metadata",
    category: "Endpoints",
    content: `
## GET /video/:id

Retrieve full metadata for a YouTube video.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| id | YouTube video ID |

### Related Endpoints

- \`GET /video/:id/stream\` — Stream/download URLs
- \`GET /video/:id/thumbnail\` — Thumbnail URLs
- \`GET /video/:id/lyrics\` — Captions/lyrics transcript
- \`GET /video/:id/related\` — Related videos
    `,
  },
  {
    slug: "stream",
    title: "Stream URLs",
    category: "Endpoints",
    content: `
## GET /video/:id/stream

Returns available stream formats with direct URLs, quality labels, and codec info. Ideal for Telegram music bots that need audio extraction.

### Response Fields

Each stream object includes: \`itag\`, \`url\`, \`mimeType\`, \`quality\`, \`bitrate\`, \`hasAudio\`, \`hasVideo\`.
    `,
  },
  {
    slug: "playlist",
    title: "Playlists",
    category: "Endpoints",
    content: `
## GET /playlist/:id

Fetch playlist metadata and up to 50 videos.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| id | YouTube playlist ID |
    `,
  },
  {
    slug: "telegram-bot",
    title: "Telegram Bot Integration",
    category: "Guides",
    content: `
## Step-by-Step: Telegram Music Bot

### 1. Register & Get API Key

1. Create an account at the dashboard
2. Copy your \`ytapi_\` key from the API Keys page
3. Store it in \`.env\` as \`YTAPI_KEY\`

### 2. Install Dependencies (Python)

\`\`\`bash
pip install python-telegram-bot requests
\`\`\`

### 3. Basic Search Handler

\`\`\`python
import os, requests
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters

YTAPI_KEY = os.environ["YTAPI_KEY"]
BASE = "${API_BASE_URL}"

async def search(update: Update, context):
    query = " ".join(context.args) or "lofi music"
    r = requests.get(f"{BASE}/search", params={"q": query, "limit": 5},
                     headers={"Authorization": f"Bearer {YTAPI_KEY}"})
    videos = r.json()["data"]["videos"]
    text = "\\n".join(f"🎵 {v['title']} — /play_{v['id']}" for v in videos)
    await update.message.reply_text(text or "No results")

app = Application.builder().token(os.environ["BOT_TOKEN"]).build()
app.add_handler(CommandHandler("search", search))
app.run_polling()
\`\`\`

### 4. Stream & Send Audio

Use \`/video/{id}/stream\` to get audio URLs, then send via \`send_audio\`.

### 5. Error Handling

Always check \`success\` field and handle \`429\` rate limits with exponential backoff.
    `,
  },
  {
    slug: "errors",
    title: "Error Codes",
    category: "Reference",
    content: `
## Error Reference

| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing API key |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid parameters |
| RATE_LIMIT_EXCEEDED | 429 | Per-minute limit hit |
| QUOTA_EXCEEDED | 429 | Daily quota exhausted |
| VIDEO_NOT_FOUND | 404 | Video unavailable |
| PLAYLIST_NOT_FOUND | 404 | Playlist unavailable |
| INTERNAL_ERROR | 500 | Server error |
    `,
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    category: "Advanced",
    content: `
## Webhook Events

Configure webhooks in your dashboard to receive notifications:

- \`QUOTA_WARNING\` — Approaching daily limit (80%)
- \`QUOTA_EXCEEDED\` — Daily quota reached
- \`KEY_REVOKED\` — API key deactivated
- \`SUBSCRIPTION_CHANGED\` — Plan upgrade/downgrade

### Payload Format

\`\`\`json
{
  "event": "QUOTA_WARNING",
  "timestamp": "2026-06-19T00:00:00Z",
  "data": { "usage": 800, "limit": 1000 }
}
\`\`\`

Verify signatures using the \`X-YTAPI-Signature\` header (HMAC-SHA256 of body with your webhook secret).
    `,
  },
];

export function getDocSection(slug: string) {
  return DOC_SECTIONS.find((s) => s.slug === slug);
}

export const DOC_CATEGORIES = [...new Set(DOC_SECTIONS.map((s) => s.category))];
