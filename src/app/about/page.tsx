import { Metadata } from "next";
import AboutPage from "./about-page";

export const metadata: Metadata = {
  title: 'About VidOcean - Free Video Downloader | Our Story & Mission',
  description: 'Learn about VidOcean, the leading free video downloader supporting 1000+ platforms including YouTube, Instagram, TikTok, Facebook. Our mission is to provide fast, reliable, and free video downloading services.',
  keywords: 'about vidocean, video downloader company, free video downloader service, video download platform, vidocean story, video downloader mission, online video tools, about us',
  
  openGraph: {
    title: 'About VidOcean - Leading Free Video Downloader Platform',
    description: 'Discover VidOcean\'s journey as the premier free video downloader supporting 1000+ platforms. Learn about our mission and commitment to free video downloading.',
    url: 'https://vidocean.xyz/about',
    images: [{ 
      url: 'https://vidocean.xyz/og-about.png', 
      width: 1200, 
      height: 630, 
      alt: 'About VidOcean - Free Video Downloader Platform' 
    }],
    type: 'website',
  },
  
  twitter: {
    title: 'About VidOcean - Free Video Downloader',
    description: 'Learn about VidOcean, the leading free video downloader platform supporting 1000+ websites.',
    images: ['https://vidocean.xyz/twitter-about.png'],
  },
  
  alternates: { canonical: 'https://vidocean.xyz/about' },
};


export default function About(){
  return <AboutPage/>
}