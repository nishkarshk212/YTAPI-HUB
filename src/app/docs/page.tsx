import Link from "next/link";
import { DOC_SECTIONS, DOC_CATEGORIES } from "@/lib/docs";
import { cn } from "@/lib/utils";

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Documentation</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to integrate YTAPI Hub with your Telegram bot or application.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="sticky top-24 space-y-6">
            {DOC_CATEGORIES.map((cat) => (
              <div key={cat}>
                <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{cat}</h3>
                <ul className="space-y-1">
                  {DOC_SECTIONS.filter((s) => s.category === cat).map((section) => (
                    <li key={section.slug}>
                      <Link
                        href={`/docs/${section.slug}`}
                        className="block rounded-md px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                      >
                        {section.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            {DOC_SECTIONS.map((section) => (
              <Link key={section.slug} href={`/docs/${section.slug}`}>
                <div className={cn("rounded-xl border border-border p-5 hover:border-primary/50 transition-colors h-full")}>
                  <span className="text-xs text-primary font-medium">{section.category}</span>
                  <h2 className="mt-1 font-semibold">{section.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
