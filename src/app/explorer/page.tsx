"use client";

import { useState } from "react";
import { Play, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeTabs } from "@/components/docs/code-tabs";
import { API_BASE_URL } from "@/lib/constants";

const ENDPOINTS = [
  { method: "GET", path: "/search", params: "q=lofi+music&limit=5" },
  { method: "GET", path: "/video/{id}", params: "" },
  { method: "GET", path: "/video/{id}/stream", params: "" },
  { method: "GET", path: "/video/{id}/thumbnail", params: "" },
  { method: "GET", path: "/video/{id}/lyrics", params: "" },
  { method: "GET", path: "/video/{id}/related", params: "limit=5" },
  { method: "GET", path: "/playlist/{id}", params: "" },
];

export default function ExplorerPage() {
  const [apiKey, setApiKey] = useState("");
  const [selected, setSelected] = useState(ENDPOINTS[0]);
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [playlistId, setPlaylistId] = useState("");
  const [query, setQuery] = useState("lofi music");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  function buildUrl() {
    let path = selected.path;
    if (path.includes("/video/")) path = path.replace("{id}", videoId);
    if (path.includes("/playlist/")) path = path.replace("{id}", playlistId || "PLrAXtmRdnEQy6nuLMH8k");

    const params = new URLSearchParams();
    if (selected.path === "/search") {
      params.set("q", query);
      params.set("limit", "5");
    } else if (selected.params) {
      selected.params.split("&").forEach((p) => {
        const [k, v] = p.split("=");
        if (k && v) params.set(k, decodeURIComponent(v.replace(/\+/g, " ")));
      });
    }

    const qs = params.toString();
    return `${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`;
  }

  async function runRequest() {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(), {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
    } catch (err) {
      setResponse(String(err));
    }
    setLoading(false);
  }

  const curlExample = {
    lang: "curl" as const,
    label: "cURL",
    code: `curl "${buildUrl()}"${apiKey ? ` \\\n  -H "Authorization: Bearer ${apiKey}"` : ""}`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold mb-2">API Explorer</h1>
      <p className="text-muted-foreground mb-8">Test endpoints interactively with your API key.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="ytapi_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <Label>Endpoint</Label>
                <select
                  className="mt-1 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  value={ENDPOINTS.indexOf(selected)}
                  onChange={(e) => setSelected(ENDPOINTS[parseInt(e.target.value)])}
                >
                  {ENDPOINTS.map((ep, i) => (
                    <option key={ep.path} value={i}>{ep.method} {ep.path}</option>
                  ))}
                </select>
              </div>
              {selected.path.includes("video") && (
                <div>
                  <Label>Video ID</Label>
                  <Input value={videoId} onChange={(e) => setVideoId(e.target.value)} className="mt-1 font-mono text-xs" />
                </div>
              )}
              {selected.path.includes("playlist") && (
                <div>
                  <Label>Playlist ID</Label>
                  <Input value={playlistId} onChange={(e) => setPlaylistId(e.target.value)} className="mt-1 font-mono text-xs" />
                </div>
              )}
              {selected.path === "/search" && (
                <div>
                  <Label>Search Query</Label>
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} className="mt-1" />
                </div>
              )}
              <Button onClick={runRequest} disabled={loading || !apiKey} className="w-full">
                <Play className="h-4 w-4" /> {loading ? "Sending..." : "Send Request"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <CodeTabs examples={[curlExample]} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Response</CardTitle>
              {response && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(response);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto max-h-96 bg-muted/30 rounded-lg p-4 font-mono">
                {response || "Send a request to see the response..."}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
