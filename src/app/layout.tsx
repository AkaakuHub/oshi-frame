import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const siteName: string = "推しフレーム";
const description: string = "推しの写真を、どこでも。";
const url: string = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const googleSearchConsole: string = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE ?? "";
const googleAnalyticsId: string = process.env.NEXT_PUBLIC_GA_ID ?? "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: siteName,
  description,
  keywords: ["推し", "フレーム", "写真", "カメラ"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: url,
    siteName,
    title: siteName,
    description,
    images: [
      {
        url: new URL("/ogp_default.png", url).toString(),
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: [
      {
        url: `${url}/ogp_default.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
    site: "@",
    creator: "@",
  },
  verification: {
    google: googleSearchConsole,
  },
  alternates: {
    canonical: url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
      <GoogleAnalytics gaId={googleAnalyticsId} />
        <meta name='viewport' content='initial-scale=1, viewport-fit=cover' />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
