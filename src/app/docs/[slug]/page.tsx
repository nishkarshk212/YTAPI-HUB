import Link from "next/link";
import { notFound } from "next/navigation";
import { DOC_SECTIONS, getDocSection } from "@/lib/docs";
import { CodeTabs, MarkdownContent } from "@/components/docs/code-tabs";

export function generateStaticParams() {
  return DOC_SECTIONS.map((s) => ({ slug: s.slug }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = getDocSection(slug);
  if (!section) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1 hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {DOC_SECTIONS.map((s) => (
              <Link
                key={s.slug}
                href={`/docs/${s.slug}`}
                className={`block rounded-md px-3 py-1.5 text-sm ${s.slug === slug ? "bg-muted font-medium" : "hover:bg-muted"}`}
              >
                {s.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="lg:col-span-3">
          <span className="text-sm text-primary font-medium">{section.category}</span>
          <h1 className="text-3xl font-bold mt-1 mb-6">{section.title}</h1>
          <MarkdownContent content={section.content} />
          {section.examples && section.examples.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
              <CodeTabs examples={section.examples} />
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
