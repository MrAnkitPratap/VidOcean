import { Metadata } from "next";
import TikTokDownloader from "./tiktok-client";

export const metadata: Metadata = {
  title:
    "TikTok Video Downloader - Download TikTok Videos Without Watermark | VidOcean",
  description:
    "Free TikTok video downloader. Download TikTok videos without watermark in HD quality. Fast, reliable, supports all TikTok video formats.",
  keywords:
    "TikTok downloader, download TikTok videos, TikTok video downloader, TikTok without watermark, download TikTok, free TikTok downloader",

  openGraph: {
    title: "TikTok Video Downloader - No Watermark | VidOcean",
    description:
      "Download TikTok videos without watermark in HD quality. Free, fast, reliable TikTok downloader.",
    url: "https://vidocean.xyz/tiktok-downloader",
    images: [
      {
        url: "https://vidocean.xyz/og-tiktok.png",
        width: 1200,
        height: 630,
        alt: "TikTok Video Downloader by VidOcean",
      },
    ],
  },

  alternates: {
    canonical: "https://vidocean.xyz/tiktok-downloader",
  },
};

export default function TikTokPage() { 
    return <TikTokDownloader/>
}