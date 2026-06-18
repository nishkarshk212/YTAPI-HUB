import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PLANS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return plans.length ? plans : DEFAULT_PLANS;
  } catch {
    return DEFAULT_PLANS;
  }
}

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. Scale as your Telegram bot grows.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <Card key={plan.slug} className={i === 1 ? "border-primary shadow-lg scale-105" : ""}>
            <CardHeader>
              {i === 1 && <span className="text-xs font-semibold text-primary uppercase">Most Popular</span>}
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">
                  ${((plan.priceMonthly ?? 0) / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(plan.features as string[]).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {plan.requestsPerDay.toLocaleString()} requests/day
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {plan.requestsPerMinute} requests/minute
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/register" className="w-full">
                <Button variant={i === 1 ? "default" : "outline"} className="w-full">
                  {plan.priceMonthly === 0 ? "Get Started Free" : "Upgrade"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
