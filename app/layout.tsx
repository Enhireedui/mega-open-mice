import type { Metadata, Viewport } from "next";

import { Backdrop } from "@/components/Backdrop";
import { MotionProvider } from "@/components/MotionProvider";
import { eventConfig, eventDateLabel, incentiveSentence } from "@/lib/config";

import "./globals.css";

/** Subsets that paint above the fold. Declared in app/fonts.css. */
const PRELOADED_FONTS = [
  "montserrat-latin",
  "montserrat-cyrillic",
  "montserrat-cyrillic-ext",
  "inter-cyrillic",
  "inter-cyrillic-ext",
] as const;

const dateLabel = eventDateLabel();

const description =
  `${eventConfig.title}${dateLabel ? ` — ${dateLabel}` : ""}. ` +
  `${incentiveSentence()} Онлайнаар бүртгүүлээд авьяасаа тайзан дээр гаргаарай.`;

export const metadata: Metadata = {
  metadataBase: new URL(eventConfig.siteUrl),
  title: {
    default: `${eventConfig.title} · ${eventConfig.distributor}`,
    template: `%s · ${eventConfig.distributor}`,
  },
  description,
  applicationName: eventConfig.title,
  keywords: [
    "SAIN MOTORS",
    "MEGA OPEN MIC",
    "open mic",
    "open mic Mongolia",
    "дуулах тэмцээн",
    "авьяас",
    "шатахууны талон",
    "Улаанбаатар",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: eventConfig.siteUrl,
    siteName: eventConfig.distributor,
    title: `${eventConfig.title} · ${eventConfig.distributor}`,
    description,
    images: [
      {
        url: "/event/open-mic-poster.jpg",
        width: 1600,
        height: 1600,
        alt: eventConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${eventConfig.title} · ${eventConfig.distributor}`,
    description,
    images: ["/event/open-mic-poster.jpg"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#070B16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <head>
        {PRELOADED_FONTS.map((file) => (
          <link
            key={file}
            rel="preload"
            href={`/fonts/${file}.woff2`}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className="relative min-h-svh antialiased">
        <Backdrop />
        <MotionProvider>
          <div className="relative z-10">{children}</div>
        </MotionProvider>
      </body>
    </html>
  );
}
