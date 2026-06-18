# YTAPI Hub

A modern, scalable YouTube API platform for **Telegram music bots** and public developers. Includes a secure REST API, developer dashboard, admin panel, interactive documentation, and API explorer.

## Features

- **REST API v1** — Search, video metadata, stream URLs, thumbnails, lyrics, related videos, playlists
- **Authentication** — SHA-256 hashed API keys with Bearer token support
- **Rate limiting** — Per-plan daily and per-minute quotas
- **Developer dashboard** — API key management, usage analytics, subscriptions, webhooks
- **Admin panel** — User control, key management, plan/rate limit config, analytics
- **Documentation** — Interactive examples (cURL, JavaScript, Python, Node.js, PHP)
- **API Explorer** — Live endpoint testing
- **Status page & changelog**
- **Dark/light mode** — Responsive, developer-friendly UI

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth.js (credentials)
- Tailwind CSS + Radix UI
- youtubei.js (InnerTube API)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)

### Setup

```bash
cd ~/Projects/ytapi-hub
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# Start PostgreSQL (Docker)
docker compose up -d

# Initialize database
npx prisma db push
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Accounts (after seed)

| Role  | Email           | Password     |
|-------|-----------------|--------------|
| Admin | admin@ytapi.dev | admin123456  |
| Demo  | demo@ytapi.dev  | demo123456   |

## API Base URL

```
http://localhost:3000/api/v1
```

### Authentication

```bash
curl "http://localhost:3000/api/v1/search?q=lofi+music" \
  -H "Authorization: Bearer ytapi_your_api_key"
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=` | Search videos |
| GET | `/video/:id` | Video metadata |
| GET | `/video/:id/stream` | Stream URLs |
| GET | `/video/:id/thumbnail` | Thumbnail URLs |
| GET | `/video/:id/lyrics` | Captions/lyrics |
| GET | `/video/:id/related` | Related videos |
| GET | `/playlist/:id` | Playlist data |

## Project Structure

```
src/
├── app/
│   ├── api/v1/          # Public REST API
│   ├── api/dashboard/   # Dashboard API
│   ├── api/admin/       # Admin API
│   ├── dashboard/       # User dashboard
│   ├── admin/           # Admin panel
│   ├── docs/            # Documentation
│   ├── explorer/        # API explorer
│   └── ...
├── components/          # UI components
└── lib/                 # Core libraries
    ├── youtube/         # YouTube client
    ├── rate-limit.ts    # Auth + rate limiting
    └── docs.ts          # Documentation content
```

## Environment Variables

See `.env.example` for all configuration options.

## Production

1. Set `NEXTAUTH_URL` and `API_BASE_URL` to your production domain
2. Use a strong `NEXTAUTH_SECRET` (32+ characters)
3. Deploy to Vercel, Railway, or Docker
4. Connect a managed PostgreSQL instance

## License

MIT
