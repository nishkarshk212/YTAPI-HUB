"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<Array<{
    id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    user: { email: string };
    plan: { name: string } | null;
    _count: { usageLogs: number };
  }>>([]);

  useEffect(() => {
    fetch("/api/admin/keys").then((r) => r.json()).then((d) => setKeys(d.keys ?? []));
  }, []);

  async function toggleKey(keyId: string, isActive: boolean) {
    await fetch("/api/admin/keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId, isActive }),
    });
    setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, isActive } : k)));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/admin"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>
      <div className="space-y-3">
        {keys.map((key) => (
          <Card key={key.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="text-xs font-mono text-muted-foreground">{key.keyPrefix}•••• · {key.user.email}</p>
                <p className="text-xs text-muted-foreground">{key._count.usageLogs} requests · {key.plan?.name ?? "Default"}</p>
              </div>
              <Button
                size="sm"
                variant={key.isActive ? "outline" : "default"}
                onClick={() => toggleKey(key.id, !key.isActive)}
              >
                {key.isActive ? "Revoke" : "Activate"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
