import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Providers } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  CreditCard,
  Webhook,
  Shield,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/keys", label: "API Keys", icon: Key },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Providers>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 shrink-0">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium truncate">{session?.user?.email}</p>
            </div>
            <nav className="space-y-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-muted">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              )}
            </nav>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="mt-6"
            >
              <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </form>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </Providers>
  );
}
