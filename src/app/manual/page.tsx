import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeTabs } from "@/components/docs/code-tabs";
import { API_BASE_URL } from "@/lib/constants";

const faqs = [
  {
    q: "Do I need a YouTube API key from Google?",
    a: "No. YTAPI Hub handles YouTube data resolution internally. You only need a YTAPI key from our platform.",
  },
  {
    q: "Can I use this for Telegram music bots?",
    a: "Yes — YTAPI Hub is designed specifically for Telegram music bots. See our Telegram integration guide in the docs.",
  },
  {
    q: "What happens when I hit rate limits?",
    a: "You'll receive HTTP 429 with a retry_after value. Upgrade your plan for higher limits.",
  },
  {
    q: "Are stream URLs permanent?",
    a: "Stream URLs are time-limited by YouTube. Fetch fresh URLs before each playback session.",
  },
  {
    q: "How do webhooks work?",
    a: "Configure webhook URLs in your dashboard. We send HMAC-signed POST requests when events like quota warnings occur.",
  },
];

const sdkExamples = [
  {
    lang: "python" as const,
    label: "Python SDK",
    code: `# pip install requests
from ytapi_hub import YTAPIClient

client = YTAPIClient("ytapi_your_key")
results = client.search("lofi hip hop", limit=5)
stream = client.get_stream("dQw4w9WgXcQ")`,
  },
  {
    lang: "javascript" as const,
    label: "JavaScript SDK",
    code: `// npm install @ytapi-hub/sdk (example wrapper)
import { YTAPI } from "@ytapi-hub/sdk";

const api = new YTAPI("ytapi_your_key");
const { data } = await api.search("lofi hip hop");
console.log(data.videos);`,
  },
];

export default function ManualPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold mb-2">Installation Manual</h1>
      <p className="text-muted-foreground mb-10">
        Complete setup guide for self-hosting YTAPI Hub or integrating as a developer.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Self-Hosting</h2>
        <Card>
          <CardContent className="p-0">
            <pre className="p-4 text-sm overflow-x-auto">{`# 1. Clone and install
git clone https://github.com/your-org/ytapi-hub.git
cd ytapi-hub
npm install

# 2. Configure environment
cp .env.example .env
# Edit DATABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Start PostgreSQL
docker compose up -d

# 4. Run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev

# API available at ${API_BASE_URL}`}</pre>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
        <Card>
          <CardContent className="p-0">
            <pre className="p-4 text-sm">{`DATABASE_URL=postgresql://user:pass@localhost:5432/ytapi_hub
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-chars
API_BASE_URL=http://localhost:3000/api/v1
ADMIN_EMAIL=admin@ytapi.dev
ADMIN_PASSWORD=secure-password`}</pre>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">SDK Examples</h2>
        <CodeTabs examples={sdkExamples} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Production Deployment</h2>
        <div className="prose-docs">
          <ul>
            <li>Deploy to Vercel, Railway, or Docker with PostgreSQL</li>
            <li>Set <code>NEXTAUTH_URL</code> to your production domain</li>
            <li>Use a strong <code>NEXTAUTH_SECRET</code> (32+ random characters)</li>
            <li>Configure <code>API_BASE_URL</code> to your public API URL</li>
            <li>Enable HTTPS — API keys must never travel over plain HTTP</li>
          </ul>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <CardHeader><CardTitle className="text-base">{faq.q}</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground text-sm">{faq.a}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="text-center">
        <Link href="/docs/telegram-bot">
          <Button size="lg">Telegram Bot Integration Guide</Button>
        </Link>
      </div>
    </div>
  );
}
