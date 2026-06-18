"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

const EVENTS = ["QUOTA_WARNING", "QUOTA_EXCEEDED", "KEY_REVOKED", "SUBSCRIPTION_CHANGED"];

type Webhook = {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["QUOTA_EXCEEDED"]);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/webhooks");
    const data = await res.json();
    setWebhooks(data.webhooks ?? []);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events: selectedEvents }),
    });
    const data = await res.json();
    if (data.webhook?.secret) setNewSecret(data.webhook.secret);
    setUrl("");
    load();
  }

  async function remove(id: string) {
    await fetch("/api/webhooks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Webhooks</h1>

      {newSecret && (
        <Card className="mb-6 border-primary">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Webhook secret (save now):</p>
            <code className="block bg-muted rounded p-2 text-xs font-mono break-all">{newSecret}</code>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Add Webhook</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Endpoint URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-bot.com/webhook" className="mt-1" />
          </div>
          <div>
            <Label>Events</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EVENTS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEvent(e)}
                  className={`rounded-full px-3 py-1 text-xs border ${selectedEvents.includes(e) ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={create} disabled={!url}><Plus className="h-4 w-4" /> Add Webhook</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {webhooks.map((wh) => (
          <Card key={wh.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono text-sm">{wh.url}</p>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {wh.events.map((e) => <Badge key={e} variant="outline">{e}</Badge>)}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(wh.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
