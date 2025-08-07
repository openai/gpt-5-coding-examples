"use client";

import * as React from "react";
import type { CodeExample } from "@/lib/code-examples";

/** Card dimensions: height 13rem, width 4:3 ratio */
const CARD_HEIGHT_REM = 13;
const CARD_WIDTH_REM = (CARD_HEIGHT_REM * 4) / 3;

export const AppCard = React.memo(function AppCard({
  app,
  onOpen,
}: {
  app: CodeExample;
  onOpen: (app: CodeExample) => void;
}) {
  return (
    <button
      onClick={() => onOpen(app)}
      className="relative block h-52 overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/60"
      style={{ width: `${CARD_WIDTH_REM}rem` }}
      aria-label={`Open ${app.title}`}
    >
      <img
        src={app.poster}
        alt={app.title}
        className="h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
    </button>
  );
});
