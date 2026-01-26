# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository showcases demo applications generated entirely in a single GPT-5 or GPT-5.2 prompt. It serves as reference and inspiration—contributions are not accepted.

## Development Commands

All commands run from the `front-end/` directory:

```bash
cd front-end
npm install
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

### Directory Structure

- **`/apps/`** - Static HTML/JS demo applications (64+ examples like asteroid-game, pomodoro, etc.)
- **`/examples/`** - YAML metadata files defining each demo's title, prompt, tags, and screenshot URL
- **`/front-end/`** - Next.js 15 application that serves as the gallery UI

### Build Process

The `copy-docs.mjs` script (runs via `prebuild` and `dev`) copies `/apps/*` subdirectories into `/front-end/public/` so demos are served as static files.

### Data Flow

1. YAML files in `/examples/` define demo metadata (id, title, prompt, tags)
2. `lib/code-examples.ts` loads and parses these YAMLs at build time
3. `page.tsx` renders the `AppGrid` component displaying all demos
4. Each demo's iframe loads from `/public/{demo-id}/` (originally `/apps/{demo-id}/`)

### Tech Stack

- Next.js 15 with App Router and Turbopack
- React 19, TypeScript, Tailwind CSS v4
- shadcn/ui components (Radix primitives)

### 守ってほしいこと
- ソースコード内のコメントは日本語で記述すること
- TypeScriptにおいて、必要以上にクラスを利用しないこと
- 既存のディレクトリ構成・命名・状態管理の流儀にそろえること
