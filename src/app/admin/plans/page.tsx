"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  slug: string;
  requestsPerDay: number;
  requestsPerMinute: number;
  maxApiKeys: number;
  priceMonthly: number;
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch("/api/admin/plans").then((r) => r.json()).then((d) => setPlans(d.plans ?? []));
  }, []);

  async function updatePlan(planId: string, field: string, value: number) {
    await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, [field]: value }),
    });
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, [field]: value } : p)));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/admin"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <h1 className="text-2xl font-bold mb-6">Plans & Rate Limits</h1>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader><CardTitle>{plan.name}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Requests / Day</Label>
                <Input
                  type="number"
                  value={plan.requestsPerDay}
                  onChange={(e) => updatePlan(plan.id, "requestsPerDay", parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Requests / Minute</Label>
                <Input
                  type="number"
                  value={plan.requestsPerMinute}
                  onChange={(e) => updatePlan(plan.id, "requestsPerMinute", parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Max API Keys</Label>
                <Input
                  type="number"
                  value={plan.maxApiKeys}
                  onChange={(e) => updatePlan(plan.id, "maxApiKeys", parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
