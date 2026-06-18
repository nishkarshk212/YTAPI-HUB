"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";
import { Check } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number;
  requestsPerDay: number;
  requestsPerMinute: number;
  features: string[];
};

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<{ plan: Plan; status: string } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/subscription").then((r) => r.json()).then((d) => {
      setSubscription(d.subscription);
      setPlans(d.plans ?? []);
    });
  }, []);

  async function upgrade(slug: string) {
    setLoading(slug);
    const res = await fetch("/api/dashboard/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planSlug: slug }),
    });
    const data = await res.json();
    setMessage(data.message ?? "Plan updated");
    setSubscription(data.subscription);
    setLoading(null);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Subscription</h1>
      {subscription && (
        <p className="text-muted-foreground mb-6">
          Current plan: <Badge>{subscription.plan.name}</Badge> ({subscription.status})
        </p>
      )}
      {message && <p className="text-sm text-primary mb-4">{message}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.slug} className={subscription?.plan.slug === plan.slug ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <p className="text-2xl font-bold pt-2">
                ${(plan.priceMonthly / 100).toFixed(0)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={subscription?.plan.slug === plan.slug ? "secondary" : "default"}
                disabled={subscription?.plan.slug === plan.slug || loading === plan.slug}
                onClick={() => upgrade(plan.slug)}
              >
                {subscription?.plan.slug === plan.slug ? "Current Plan" : loading === plan.slug ? "Updating..." : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
