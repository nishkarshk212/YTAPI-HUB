import Link from "next/link";
import { ArrowRight, Bot, Code2, Shield, Zap, Search, Music, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL, APP_NAME } from "@/lib/constants";

const features = [
  { icon: Search, title: "Video Search", desc: "Full-text search with rich metadata, thumbnails, and channel info." },
  { icon: Music, title: "Stream URLs", desc: "Direct audio/video stream URLs for Telegram bot playback." },
  { icon: Code2, title: "Developer First", desc: "REST API with cURL, JS, Python, Node.js, and PHP examples." },
  { icon: Shield, title: "Secure Keys", desc: "SHA-256 hashed API keys with per-plan rate limits." },
  { icon: Bot, title: "Telegram Ready", desc: "Step-by-step guides for music bot integration." },
  { icon: BarChart3, title: "Usage Analytics", desc: "Real-time dashboard with endpoint breakdowns." },
];

const endpoints = [
  "GET /search",
  "GET /video/:id",
  "GET /video/:id/stream",
  "GET /video/:id/thumbnail",
  "GET /video/:id/lyrics",
  "GET /video/:id/related",
  "GET /playlist/:id",
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              Built for Telegram music bots & developers
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              The <span className="gradient-text">YouTube API</span> your bot deserves
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Search videos, fetch metadata, resolve stream URLs, get lyrics, and manage playlists —
              all through one secure REST API with generous free tier.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Free API Key <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Read the Docs
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-mono">{API_BASE_URL}</p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/20 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border/60">
                <CardHeader>
                  <f.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold">Simple, predictable API</h2>
              <p className="mt-4 text-muted-foreground">
                Every endpoint returns consistent JSON. Authenticate with a Bearer token and start building in minutes.
              </p>
              <Link href="/explorer" className="inline-block mt-6">
                <Button variant="outline">Try the API Explorer</Button>
              </Link>
            </div>
            <Card className="font-mono text-sm">
              <CardContent className="p-0">
                <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">Available Endpoints</div>
                <ul className="divide-y divide-border">
                  {endpoints.map((ep) => (
                    <li key={ep} className="px-4 py-2.5 flex items-center gap-2">
                      <span className="text-primary font-semibold">{ep.split(" ")[0]}</span>
                      <span className="text-muted-foreground">{ep.split(" ").slice(1).join(" ")}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-primary/5 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold">Start building today</h2>
          <p className="mt-4 text-muted-foreground">
            1,000 free requests per day. No credit card required.
          </p>
          <Link href="/register" className="inline-block mt-8">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
