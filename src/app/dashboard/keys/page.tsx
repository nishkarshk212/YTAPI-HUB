"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";
import { Plus, Copy, Check } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadKeys() {
    const res = await fetch("/api/dashboard/keys");
    const data = await res.json();
    setKeys(data.keys ?? []);
  }

  useEffect(() => { loadKeys(); }, []);

  async function createKey() {
    setLoading(true);
    const res = await fetch("/api/dashboard/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "New Key" }),
    });
    const data = await res.json();
    if (data.secret) setNewSecret(data.secret);
    setNewKeyName("");
    await loadKeys();
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API Keys</h1>

      {newSecret && (
        <Card className="mb-6 border-primary">
          <CardHeader><CardTitle className="text-base">New Key Created</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted rounded-lg p-3 text-sm font-mono break-all">{newSecret}</code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(newSecret);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Save this key — it won&apos;t be shown again.</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Create New Key</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Key name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
          <Button onClick={createKey} disabled={loading}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {keys.map((key) => (
          <Card key={key.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{key.keyPrefix}••••••••</p>
                {key.lastUsedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last used: {new Date(key.lastUsedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Badge variant={key.isActive ? "success" : "outline"}>{key.isActive ? "Active" : "Revoked"}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
