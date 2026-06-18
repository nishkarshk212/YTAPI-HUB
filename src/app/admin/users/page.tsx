"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    subscription?: { plan: { name: string; slug: string } };
    _count: { apiKeys: number; usageLogs: number };
  }>>([]);

  useEffect(() => {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? []));
  }, []);

  async function updateRole(userId: string, role: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/admin"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">{user.name} · {user.subscription?.plan.name ?? "No plan"}</p>
                <p className="text-xs text-muted-foreground mt-1">{user._count.apiKeys} keys · {user._count.usageLogs} requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "ADMIN" ? "success" : "outline"}>{user.role}</Badge>
                {user.role !== "ADMIN" && (
                  <Button size="sm" variant="outline" onClick={() => updateRole(user.id, "ADMIN")}>Make Admin</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
