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

`out/` に静的ファイルが生成されます。

## GitHub Pages 配信

このリポジトリをGitHub Pagesで公開する場合は、公開用スクリプトを使ってください。

```bash
npm run build:pages
```

手動でリポジトリ名を変更する場合は、次の形式です。

```bash
NEXT_PUBLIC_BASE_PATH=/your-repository-name npm run build
```
