import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://rinrituroadster.github.io/roadsterMarin/";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "中古車呪縛霊まりんちゃん",
  description:
    "中古車呪縛霊まりんちゃんの4コマ漫画・無料漫画・無料まんがを読める公式紹介サイト。海沿いの夜風とシティポップの余韻で楽しむノスタルジックロードコメディ。",
  keywords: [
    "中古車呪縛霊まりんちゃん",
    "4コマ漫画",
    "無料漫画",
    "無料まんが",
    "漫画",
    "web漫画",
    "ロードスター",
    "ネオノスタルジー",
    "シティポップ"
  ],
  applicationName: "中古車呪縛霊まりんちゃん",
  authors: [{ name: "@roadsterMarin" }],
  creator: "@roadsterMarin",
  publisher: "@roadsterMarin",
  category: "comics",
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: SITE_URL
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "中古車呪縛霊まりんちゃん",
    description:
      "4コマ漫画・無料漫画・無料まんがとして楽しめる、中古車呪縛霊まりんちゃんの公式サイト。",
    siteName: "中古車呪縛霊まりんちゃん",
    locale: "ja_JP",
    images: [
      {
        url: `${SITE_URL}images/hero1.png`,
        alt: "中古車呪縛霊まりんちゃんのキービジュアル"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "中古車呪縛霊まりんちゃん",
    description:
      "4コマ漫画・無料漫画・無料まんがとして楽しめる、中古車呪縛霊まりんちゃんの公式サイト。",
    creator: "@roadsterMarin",
    images: [`${SITE_URL}images/hero1.png`]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
