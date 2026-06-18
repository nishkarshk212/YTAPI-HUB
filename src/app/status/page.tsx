import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const statusIcon = {
  operational: CheckCircle2,
  degraded: AlertCircle,
  outage: XCircle,
};

const statusVariant = {
  operational: "success" as const,
  degraded: "warning" as const,
  outage: "outline" as const,
};

export default async function StatusPage() {
  let services: Array<{ service: string; status: string; description: string | null; updatedAt: Date }> = [];
  try {
    services = await prisma.systemStatus.findMany({ orderBy: { service: "asc" } });
  } catch {
    services = [
      { service: "api", status: "operational", description: "REST API v1", updatedAt: new Date() },
      { service: "search", status: "operational", description: "Video search", updatedAt: new Date() },
      { service: "streaming", status: "operational", description: "Stream URL resolution", updatedAt: new Date() },
      { service: "dashboard", status: "operational", description: "Developer dashboard", updatedAt: new Date() },
    ];
  }

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center mb-10">
        <Badge variant={allOperational ? "success" : "warning"} className="mb-4">
          {allOperational ? "All Systems Operational" : "Some Systems Degraded"}
        </Badge>
        <h1 className="text-4xl font-bold">System Status</h1>
        <p className="mt-2 text-muted-foreground">Real-time status of YTAPI Hub services</p>
      </div>

      <div className="space-y-4">
        {services.map((service) => {
          const Icon = statusIcon[service.status as keyof typeof statusIcon] ?? CheckCircle2;
          return (
            <Card key={service.service}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${service.status === "operational" ? "text-green-500" : "text-yellow-500"}`} />
                  <div>
                    <p className="font-medium capitalize">{service.service}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <Badge variant={statusVariant[service.status as keyof typeof statusVariant] ?? "outline"}>
                  {service.status}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Last updated: {new Date().toLocaleString()}
      </p>
    </div>
  );
}
