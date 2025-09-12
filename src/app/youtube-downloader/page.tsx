import { Metadata } from "next";
import YoutubeDownloader from "./youtube-client";

// app/youtube-downloader/page.tsx

export const metadata: Metadata = {
  title:
    "YouTube Video Downloader - Download YouTube Videos & Shorts | VidOcean",
  description:
    "Free YouTube video downloader. Download YouTube videos, shorts, and audio in HD quality. Fast, reliable, no registration. Supports all video formats and resolutions up to 4K.",
  keywords:
    "YouTube downloader, download YouTube videos, YouTube video downloader, YouTube shorts downloader, YouTube audio downloader, download YouTube, free YouTube downloader",

  openGraph: {
    title: "YouTube Video Downloader - Free HD Downloads | VidOcean",
    description:
      "Download YouTube videos and shorts in HD quality. Free, fast, reliable YouTube downloader with audio support.",
    url: "https://vidocean.xyz/youtube-downloader",
    images: [
      {
        url: "https://vidocean.xyz/og-youtube.png",
        width: 1200,
        height: 630,
        alt: "YouTube Video Downloader by VidOcean",
      },
    ],
  },

  twitter: {
    title: "YouTube Video Downloader - VidOcean",
    description:
      "Download YouTube videos & shorts in HD. Free, fast, reliable.",
  },

  alternates: {
    canonical: "https://vidocean.xyz/youtube-downloader",
  },
};

export default function YouTubePage() {
  return <YoutubeDownloader />;
}
