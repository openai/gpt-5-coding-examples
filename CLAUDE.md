# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A showcase website for 64+ demo applications generated entirely by GPT-5/GPT-5.2 from single prompts. The front-end is a Next.js static export that displays these demos in an auto-scrolling grid with iframe previews and prompt metadata.

## Development Commands

All commands run from the `/front-end` directory:

```bash
npm install          # Install dependencies
npm run dev          # Dev server with Turbopack at localhost:3000
npm run build        # Production build (auto-copies /apps to /public first)
npm run lint         # ESLint
```

There is no test suite configured.

## Architecture

### Directory Layout

- **`/front-end`** — Next.js 15 app (React 19, App Router, Tailwind CSS v4, shadcn/ui)
- **`/apps`** — 64+ self-contained example apps (each has `index.html` + assets)
- **`/examples`** — YAML metadata files (one per app: title, prompt, tags, screenshot URL)

### Build Pipeline

1. `prebuild` script runs `scripts/copy-docs.mjs` which copies all `/apps/*` directories into `/front-end/public/`
2. `next.config.ts` dynamically detects example dirs in `/public` and creates URL rewrites (e.g., `/asteroid-game` → `/asteroid-game/index.html`)
3. Output is a fully static HTML export (`output: "export"` in Next.js config)

### Key Data Flow

- `lib/load-yaml.ts` walks the filesystem to find all `.yaml`/`.yml` files in `/examples`
- `lib/code-examples.ts` parses YAML into `CodeExample` objects used by components
- `AppGrid` renders auto-scrolling marquee rows of `AppCard` components
- `AppCard` opens an `AppModal` with a split layout: iframe preview (left) + prompt/metadata (right)

### Path Alias

`@/*` maps to the `/front-end` root directory (configured in `tsconfig.json`).

### UI Stack

shadcn/ui (New York style) with Radix UI primitives, Tailwind CSS v4, Lucide icons, and custom OpenAI Sans font faces loaded from CDN.

## Notes

- Not accepting external contributions (reference/inspiration repo only)
- Example apps are static single-page HTML apps served via iframe
- Some examples have v5.2 variants (e.g., `asteroid-game` and `asteroid-game-5.2`)
