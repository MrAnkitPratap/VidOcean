import { Metadata } from "next";
import InstagramDownloader from "./instagram-client";

export const metadata: Metadata = {
  title:
    "Instagram Video Downloader - Download Instagram Reels, IGTV, Stories | VidOcean",
  description:
    "Free Instagram video downloader. Download Instagram reels, IGTV videos, stories, and posts in original quality. Fast, secure, no login required.",
  keywords:
    "Instagram downloader, download Instagram videos, Instagram reels downloader, Instagram stories downloader, IGTV downloader, Instagram video download",

  openGraph: {
    title: "Instagram Video Downloader - Free Downloads | VidOcean",
    description:
      "Download Instagram reels, videos, and stories in original quality. Fast, free, secure Instagram downloader.",
    url: "https://vidocean.xyz/instagram-downloader",
    images: [
      {
        url: "https://vidocean.xyz/og-instagram.png",
        width: 1200,
        height: 630,
        alt: "Instagram Video Downloader by VidOcean",
      },
    ],
  },

  alternates: {
    canonical: "https://vidocean.xyz/instagram-downloader",
  },
};

export default function InstagramPage() { 
    return <InstagramDownloader/>
}