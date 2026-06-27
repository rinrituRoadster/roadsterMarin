# 海夢 漫画紹介サイト

Next.js + TypeScript + Tailwind CSS で構築した、静的書き出し前提のサイトです。

## 開発

```bash
npm install
npm run dev
```

## 静的書き出し

```bash
npm run build
```

`out/` に公開用ファイルが生成されます。

## GitHub Pages 配信

リポジトリ名配下で公開する場合は、ビルド時に `NEXT_PUBLIC_BASE_PATH` を付けてください。

```bash
NEXT_PUBLIC_BASE_PATH=/your-repository-name npm run build
```

例:

```bash
NEXT_PUBLIC_BASE_PATH=/marin-site npm run build
```
