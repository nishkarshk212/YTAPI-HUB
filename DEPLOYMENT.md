# Deployment Guide — Vercel + Render

## Architecture

| Platform | Role | URL pattern |
|----------|------|-------------|
| **Vercel** | Website — landing, docs, dashboard, auth, admin | `https://your-app.vercel.app` |
| **Render** | Public REST API — `/api/v1/*` for bots & developers | `https://ytapi-hub-api.onrender.com/api/v1` |
| **Render Postgres** | Shared database (both platforms connect here) | Internal + external connection string |

Both platforms run the same Next.js repo but serve different purposes:
- **Developers** register on Vercel, manage keys in the dashboard
- **Telegram bots** call the Render API base URL with their `ytapi_` key

---

## Step 1 — Deploy API on Render

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **New → Blueprint**
3. Connect GitHub repo: `nishkarshk212/YTAPI-HUB`
4. Render reads `render.yaml` and creates:
   - Web service: `ytapi-hub-api`
   - PostgreSQL: `ytapi-hub-db`
5. After deploy, copy your service URL (e.g. `https://ytapi-hub-api.onrender.com`)
6. In Render dashboard → **ytapi-hub-api** → **Environment**, set:

```
API_BASE_URL=https://ytapi-hub-api.onrender.com/api/v1
NEXTAUTH_URL=https://ytapi-hub-api.onrender.com
```

7. Run seed once (Render Shell):
```bash
npm run db:seed
```

8. Copy **External Database URL** from Render Postgres → you'll need it for Vercel.

---

## Step 2 — Deploy Website on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import GitHub repo: `nishkarshk212/YTAPI-HUB`
3. Framework: **Next.js** (auto-detected)
4. Add environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Render Postgres **External** connection string |
| `NEXTAUTH_SECRET` | Same secret as Render (generate: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://ytapi-hub-api.onrender.com/api/v1` |
| `API_BASE_URL` | `https://ytapi-hub-api.onrender.com/api/v1` |
| `APP_NAME` | `YTAPI Hub` |

5. Deploy

---

## Step 3 — Verify

**Website (Vercel):**
- Open `https://your-app.vercel.app`
- Register / login → dashboard works

**API (Render):**
```bash
curl "https://ytapi-hub-api.onrender.com/api/v1/search?q=lofi" \
  -H "Authorization: Bearer ytapi_your_key"
```

**Health check:**
```bash
curl https://ytapi-hub-api.onrender.com/api/health
```

---

## CLI Deploy (optional)

```bash
# Vercel
npx vercel login
npx vercel --prod

# Render — use Blueprint in dashboard (no CLI required)
# Or connect repo at dashboard.render.com
```

---

## Notes

- Render free tier spins down after inactivity (~50s cold start on first request)
- Use the **same** `NEXTAUTH_SECRET` and `DATABASE_URL` on both platforms
- Docs and API Explorer on Vercel use `NEXT_PUBLIC_API_BASE_URL` → points to Render
- CORS is enabled on `/api/v1` for cross-origin bot requests
