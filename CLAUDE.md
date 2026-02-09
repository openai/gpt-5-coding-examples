# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

GPT-5/GPT-5.2 の単一プロンプトから生成された64以上のデモアプリケーションを紹介するショーケースサイト。フロントエンドは Next.js の静的エクスポートで、自動スクロールするグリッド上に iframe プレビューとプロンプトのメタデータを表示します。

## 開発コマンド

すべてのコマンドは `/front-end` ディレクトリから実行します:

```bash
npm install          # 依存関係のインストール
npm run dev          # Turbopack による開発サーバー (localhost:3000)
npm run build        # 本番ビルド (事前に /apps を /public に自動コピー)
npm run lint         # ESLint
```

テストスイートは設定されていません。

## アーキテクチャ

### ディレクトリ構成

- **`/front-end`** — Next.js 15 アプリ (React 19, App Router, Tailwind CSS v4, shadcn/ui)
- **`/apps`** — 64以上の自己完結型サンプルアプリ (各アプリに `index.html` + アセット)
- **`/examples`** — YAML メタデータファイル (アプリごとに1つ: タイトル、プロンプト、タグ、スクリーンショット URL)

### ビルドパイプライン

1. `prebuild` スクリプトが `scripts/copy-docs.mjs` を実行し、`/apps/*` の全ディレクトリを `/front-end/public/` にコピー
2. `next.config.ts` が `/public` 内のサンプルディレクトリを動的に検出し、URL リライトを生成 (例: `/asteroid-game` → `/asteroid-game/index.html`)
3. 出力は完全な静的 HTML エクスポート (Next.js 設定の `output: "export"`)

### 主要なデータフロー

- `lib/load-yaml.ts` がファイルシステムを走査し、`/examples` 内のすべての `.yaml`/`.yml` ファイルを検出
- `lib/code-examples.ts` が YAML を解析し、コンポーネントで使用する `CodeExample` オブジェクトを生成
- `AppGrid` が `AppCard` コンポーネントの自動スクロールするマーキー行をレンダリング
- `AppCard` が `AppModal` を開き、分割レイアウトで表示: iframe プレビュー (左) + プロンプト/メタデータ (右)

### パスエイリアス

`@/*` は `/front-end` のルートディレクトリにマッピング (`tsconfig.json` で設定)。

### UI スタック

shadcn/ui (New York スタイル)、Radix UI プリミティブ、Tailwind CSS v4、Lucide アイコン、CDN から読み込むカスタム OpenAI Sans フォント。

## コーディング規約

- ドキュメントやコードコメントは日本語で記述すること

## 備考

- 外部からのコントリビューションは受け付けていない (参考・インスピレーション用リポジトリ)
- サンプルアプリは iframe で表示される静的シングルページ HTML アプリ
- 一部のサンプルには v5.2 バリアントがある (例: `asteroid-game` と `asteroid-game-5.2`)
