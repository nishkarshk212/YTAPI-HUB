"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CodeExample } from "@/lib/docs";

const LANGS = ["curl", "javascript", "python", "nodejs", "php"] as const;

export function CodeTabs({ examples }: { examples: CodeExample[] }) {
  const available = examples.filter((e) => LANGS.includes(e.lang));
  const [active, setActive] = useState(available[0]?.lang ?? "curl");
  const current = available.find((e) => e.lang === active) ?? available[0];

  if (!current) return null;

  return (
    <div className="my-4 rounded-lg border border-border overflow-hidden">
      <div className="flex gap-1 border-b border-border bg-muted/50 p-1 overflow-x-auto">
        {available.map((ex) => (
          <button
            key={ex.lang}
            onClick={() => setActive(ex.lang)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
              active === ex.lang ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <pre className="p-4 text-xs leading-relaxed overflow-x-auto bg-muted/30">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}

export function MarkdownContent({ content }: { content: string }) {
  const parts = content.trim().split(/(```[\s\S]*?```)/g);

  return (
    <div className="prose-docs">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre key={i}>
              <code>{code}</code>
            </pre>
          );
        }

        return part.split("\n").map((line, j) => {
          const key = `${i}-${j}`;
          if (line.startsWith("## ")) return <h2 key={key}>{line.slice(3)}</h2>;
          if (line.startsWith("### ")) return <h3 key={key}>{line.slice(4)}</h3>;
          if (line.startsWith("| ")) {
            return (
              <div key={key} className="overflow-x-auto mb-4">
                <table className="w-full text-sm border border-border rounded-lg">
                  <tbody>
                    {line.includes("---") ? null : (
                      <tr className="border-b border-border">
                        {line.split("|").filter(Boolean).map((cell, k) => (
                          <td key={k} className="px-3 py-2 text-muted-foreground">{cell.trim()}</td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          }
          if (line.startsWith("- ")) return <li key={key}>{formatInline(line.slice(2))}</li>;
          if (line.match(/^\d+\. /)) return <li key={key}>{formatInline(line.replace(/^\d+\. /, ""))}</li>;
          if (!line.trim()) return <br key={key} />;
          return <p key={key}>{formatInline(line)}</p>;
        });
      })}
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((p, i) =>
    p.startsWith("`") && p.endsWith("`") ? (
      <code key={i}>{p.slice(1, -1)}</code>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
