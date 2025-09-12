import { Metadata } from "next";
import FacebookDownloader from "./facebook-client";

export const metadata: Metadata = {
  title:
    "Facebook Video Downloader - Download Facebook Videos & Reels | VidOcean",
  description:
    "Free Facebook video downloader. Download Facebook videos, reels, posts, and stories in HD quality. Fast, secure, no login required. Save Facebook content permanently.",
  keywords:
    "Facebook downloader, download Facebook videos, Facebook video downloader, Facebook reels downloader, download Facebook, free Facebook downloader, Facebook video saver, fb video downloader",

  openGraph: {
    title: "Facebook Video Downloader - Free HD Downloads | VidOcean",
    description:
      "Download Facebook videos, reels, posts, and stories in HD quality. Fast, free, secure Facebook downloader.",
    url: "https://vidocean.xyz/facebook-downloader",
    images: [
      {
        url: "https://vidocean.xyz/og-facebook.png",
        width: 1200,
        height: 630,
        alt: "Facebook Video Downloader by VidOcean",
      },
    ],
  },

  twitter: {
    title: "Facebook Video Downloader - VidOcean",
    description:
      "Download Facebook videos, reels, posts in HD. Free, fast, secure.",
    images: ["https://vidocean.xyz/twitter-facebook.png"],
  },

  alternates: { canonical: "https://vidocean.xyz/facebook-downloader" },
};

export default function FacebookPage() { 
    return <FacebookDownloader/>
}