"use client";

import * as React from "react";
import type { CodeExample } from "@/lib/code-examples";
import { AppCard } from "./app-card";
import { AppModal } from "./app-modal";

/* ---------- Animated track ---------- */
const Track = React.memo(function Track({
  apps,
  onOpen,
}: {
  apps: CodeExample[];
  onOpen: (app: CodeExample) => void;
}) {
  return (
    <div className="flex h-full flex-nowrap gap-4">
      {apps.map((app) => (
        <div key={app.id} className="flex-none">
          <AppCard app={app} onOpen={onOpen} />
        </div>
      ))}
    </div>
  );
});

/* ---------- Auto-scrolling row ---------- */
const AutoScrollerRow = React.memo(function AutoScrollerRow({
  apps,
  reverse = false,
  onOpen,
  duration = 20,
}: {
  apps: CodeExample[];
  reverse?: boolean;
  onOpen: (app: CodeExample) => void;
  duration?: number;
}) {
  return (
    <div className="relative h-52 overflow-hidden">
      <div
        className={[
          "flex h-full flex-nowrap will-change-transform",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          "[animation-duration:var(--marquee-duration)]",
        ].join(" ")}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ ["--marquee-duration" as any]: `${duration}s` }}
      >
        <Track apps={apps} onOpen={onOpen} />
        <Track apps={apps} onOpen={onOpen} aria-hidden />
      </div>
    </div>
  );
});

export function AppGrid({ apps }: { apps: CodeExample[] }) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<CodeExample | null>(null);
  const [query, setQuery] = React.useState("");

  const onOpen = React.useCallback((app: CodeExample) => {
    setActive(app);
    setOpen(true);
  }, []);

  const onCopy = React.useCallback(async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.prompt);
    } catch {}
  }, [active]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredApps = React.useMemo(() => {
    if (!normalizedQuery) return apps;
    return apps.filter((app) => {
      const haystack = [
        app.title,
        app.id,
        app.prompt,
        ...(app.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [apps, normalizedQuery]);

  const buckets = React.useMemo(() => {
    const ROWS = Math.min(8, Math.max(3, Math.ceil(filteredApps.length / 8)));
    const rows: CodeExample[][] = Array.from({ length: ROWS }, () => []);
    filteredApps.forEach((app, i) => rows[i % ROWS].push(app)); // deterministic
    return rows;
  }, [filteredApps]);

  return (
    <>
      <div className="min-h-screen overflow-y-auto pt-4">
        <div className="mx-auto mb-6 flex w-full max-w-3xl flex-col gap-3 px-4 text-center">
          <label className="text-sm font-semibold text-slate-700">
            Search examples
          </label>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, ID, tags, or prompt text"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
          />
          <div className="text-xs text-slate-600">
            Showing {filteredApps.length} of {apps.length} examples
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-600 shadow-sm">
            No matches found. Try a different keyword.
          </div>
        ) : (
          <div className="full-bleed flex flex-col gap-y-4">
            {buckets.map((row, i) => (
              <AutoScrollerRow
                key={i}
                apps={row.length ? row : filteredApps}
                reverse={i % 2 === 1}
                onOpen={onOpen}
                duration={18 + ((i * 2) % 8)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal; background rows keep animating */}
      <AppModal
        active={active}
        open={open}
        onOpenChange={setOpen}
        onCopy={onCopy}
      />
    </>
  );
}
