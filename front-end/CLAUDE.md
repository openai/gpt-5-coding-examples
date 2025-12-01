# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、GPT-5のコーディング例を表示するNext.jsベースのギャラリーアプリケーションです。親ディレクトリ(`../apps/`)内の複数のHTMLベースのサンプルアプリを読み込み、メタデータを取得して、アニメーション付きのカードグリッドで表示します。

## アーキテクチャ

### ビルドプロセスとデータフロー

1. **アプリのコピー**: `scripts/copy-docs.mjs`が`dev`および`prebuild`スクリプトで実行され、`../apps/`ディレクトリから`public/`へサンプルアプリをコピーします
2. **メタデータの読み込み**: `lib/load-yaml.ts`がリポジトリ全体から`.yaml`/`.yml`ファイルを再帰的に検索します
3. **データ変換**: `lib/code-examples.ts`がYAMLメタデータを解析し、`CodeExample`オブジェクトに変換します
4. **静的エクスポート**: `next.config.ts`で`output: "export"`が設定されており、完全な静的サイトとしてビルドされます

### 主要コンポーネント

- **`app/page.tsx`**: メインページ（サーバーコンポーネント）で`loadApps()`を呼び出し
- **`components/app-grid.tsx`**: クライアントコンポーネントで、アニメーション付きの横スクロールする複数の行を表示
- **`components/app-card.tsx`**: 各サンプルアプリのカード表示
- **`components/app-modal.tsx`**: アプリの詳細を表示するモーダル

### UIライブラリ

- **shadcn/ui**: `components/ui/`内のUIコンポーネントは[shadcn/ui](https://ui.shadcn.com)から生成されています
- **Tailwind CSS v4**: スタイリングに使用
- **Radix UI**: アクセシブルなプリミティブコンポーネント

## 開発コマンド

```bash
# 開発サーバーを起動（Turbopackを使用）
pnpm dev

# 本番ビルド
pnpm build

# 本番ビルドを起動
pnpm start

# Lintを実行
pnpm lint
```

## 重要な設定

- **パスエイリアス**: `@/*`は`tsconfig.json`でプロジェクトルートにマッピングされています
- **静的エクスポート**: このプロジェクトは`output: "export"`を使用しているため、動的なサーバー機能（APIルート、サーバーアクションなど）は使用できません
- **Pretty URLs**: `next.config.ts`の`rewrites()`により、開発環境で`/slug`が`/slug/index.html`にマッピングされます

## データ構造

各サンプルアプリは以下の情報を持ちます:
- `id`: ディレクトリ名/YAMLファイル名から生成されるslug
- `title`: アプリの表示名
- `prompt`: アプリの生成に使用されたプロンプト
- `poster`: CDNからの画像URL（`https://cdn.openai.com/devhub/gpt5prompts/{id}.png`）
- `iframeUrl`: public内のHTMLファイルへのパス
- `tags`: カテゴリタグ（オプション）
- `camera`/`microphone`: 権限要求フラグ（オプション）

## 新しいサンプルアプリの追加

1. `../apps/`に新しいディレクトリを作成
2. `index.html`を配置
3. 対応する`.yaml`ファイルを作成（`title`と`prompt`フィールドが必須）
4. `pnpm dev`または`pnpm build`を実行すると自動的に検出されます

## コーディング規約及びガードレール

- ソースコード内のコメントは日本語で記述すること
- TypeScriptにおいて、必要以上にクラスを利用しないこと
- 既存のディレクトリ構成・命名・状態管理の流儀に揃えること