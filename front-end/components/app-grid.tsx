"use client";

import * as React from "react";
import type { CodeExample } from "@/lib/code-examples";
import { AppCard } from "./app-card";
import { AppModal } from "./app-modal";
import { SearchBar } from "./search-bar";

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
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
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
  const [searchQuery, setSearchQuery] = React.useState("");

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

  const filteredApps = React.useMemo(() => {
    if (!searchQuery.trim()) return apps;
    
    const query = searchQuery.toLowerCase().trim();
    return apps.filter(app => {
      const searchableText = [
        app.title,
        app.prompt,
        app.id,
        ...(app.tags || [])
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
  }, [apps, searchQuery]);

  const buckets = React.useMemo(() => {
    if (searchQuery) return [];
    
    const ROWS = Math.min(8, Math.max(3, Math.ceil(apps.length / 8)));
    const rows: CodeExample[][] = Array.from({ length: ROWS }, () => []);
    apps.forEach((app, i) => rows[i % ROWS].push(app));
    return rows;
  }, [apps, searchQuery]);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <SearchBar onSearch={setSearchQuery} />
      </div>
      
      <div className="min-h-screen overflow-y-auto pt-4">
        {searchQuery && (
          <div className="text-center mb-4 px-4">
            <p className="text-gray-600">
              {filteredApps.length > 0 
                ? `Found ${filteredApps.length} example${filteredApps.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `No examples found for "${searchQuery}"`
              }
            </p>
          </div>
        )}
        
        {searchQuery ? (
          filteredApps.length > 0 && (
            <div className="px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} onOpen={onOpen} />
              ))}
            </div>
          )
        ) : (
          <div className="full-bleed flex flex-col gap-y-4">
            {buckets.map((row, i) => (
              <AutoScrollerRow
                key={i}
                apps={row}
                reverse={i % 2 === 1}
                onOpen={onOpen}
                duration={18 + ((i * 2) % 8)}
              />
            ))}
          </div>
        )}
      </div>

      <AppModal
        active={active}
        open={open}
        onOpenChange={setOpen}
        onCopy={onCopy}
      />
    </>
  );
}
