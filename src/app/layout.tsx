// app/layout.tsx
import "./globals.css";
import { Navbar } from "./components/navbar";

// ✅ CLEAN METADATA - NO VIEWPORT HERE
export const metadata = {
  title: "vidocean - Universal Video Downloader | Download from 1000+ Websites",
  description: "Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ platforms with vidocean. Fast, reliable downloads with real-time progress.",
  keywords: "vidocean, video downloader, YouTube downloader, Instagram video download, TikTok downloader, Facebook video downloader, universal video downloader",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "vidocean - Universal Video Downloader",
    description: "Download videos from 1000+ platforms with format selection and real-time progress.",
    url: "https://videoscan.xyz",
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

// 🔥 SEPARATE VIEWPORT EXPORT
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0891b2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
        <main className="pt-4 md:pt-24 lg:pt-32 pb-28 md:pb-8 px-4 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
