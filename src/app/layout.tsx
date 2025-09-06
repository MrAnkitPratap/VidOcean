import "./globals.css";
import { Navbar } from "./components/navbar";

export const metadata = {
  title: "vidocean - Universal Video Downloader | Download from 1000+ Websites",
  description: "Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ platforms with vidocean. Fast, reliable downloads with real-time progress.",
  keywords: "vidocean, video downloader, YouTube downloader, Instagram video download, TikTok downloader, Facebook video downloader, universal video downloader",
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#0891b2",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "vidocean - Universal Video Downloader",
    description: "Download videos from 1000+ platforms with format selection and real-time progress.",
    url: "https://vidocean.com",
    siteName: "vidocean",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "vidocean logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vidocean",
    creator: "@vidocean",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Remove any Next.js default icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#0891b2" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body>
        {/* Enhanced Futuristic Ocean Background */}
        <div className="ocean-background">
          <div className="underwater-light"></div>
          <div className="light-rays"></div>
          <div className="water-particles"></div>
          <div className="ocean-wave"></div>
          <div className="ocean-wave"></div>
          <div className="ocean-wave"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
          <div className="bubble"></div>
        </div>

        <Navbar />
        {/* 🔥 FIXED MOBILE SPACING - Removed extra top padding for mobile */}
        <main className="pt-4 md:pt-24 lg:pt-32 pb-28 md:pb-8 px-4 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
