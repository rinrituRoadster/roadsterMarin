import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const SITE_URL_WITH_SLASH = `${SITE_URL}/`;
const GTM_ID = "GTM-N9LN9CDZ";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL_WITH_SLASH),
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
    canonical: SITE_URL_WITH_SLASH
  },
  openGraph: {
    type: "website",
    url: SITE_URL_WITH_SLASH,
    title: "中古車呪縛霊まりんちゃん",
    description:
      "4コマ漫画・無料漫画・無料まんがとして楽しめる、中古車呪縛霊まりんちゃんの公式サイト。",
    siteName: "中古車呪縛霊まりんちゃん",
    locale: "ja_JP",
    images: [
      {
        url: `${SITE_URL}/images/hero1.webp`,
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
    images: [`${SITE_URL}/images/hero1.webp`]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Script id="google-tag-data-layer" strategy="beforeInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`}
        </Script>
        <Script
          id="google-tag-manager"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
          strategy="afterInteractive"
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
