import { Metadata } from 'next';
import HomeClient from './components/HomePage';


export const metadata: Metadata = {
  title: 'VidOcean - Free Video Downloader | Download from 1000+ Platforms',
  description: 'Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ platforms with VidOcean. Fast, free, reliable video downloader with HD quality, audio support, and real-time progress tracking.',
  keywords: 'video downloader, free video downloader, online video downloader, YouTube downloader, Instagram downloader, TikTok downloader, Facebook downloader, Twitter downloader, universal video downloader, download videos online, vidocean',
  
  openGraph: {
    title: 'VidOcean - Free Universal Video Downloader for 1000+ Platforms',
    description: 'Download videos from YouTube, Instagram, TikTok, Facebook and 1000+ more platforms. Fast, free, HD quality with audio support.',
    url: 'https://vidocean.xyz',
    images: [{ 
      url: 'https://vidocean.xyz/og-home.png', 
      width: 1200, 
      height: 630, 
      alt: 'VidOcean Universal Video Downloader' 
    }],
  },
  
  twitter: {
    title: 'VidOcean - Free Video Downloader',
    description: 'Download videos from 1000+ platforms. Fast, free, HD quality.',
    images: ['https://vidocean.xyz/twitter-home.png'],
  },
  
  alternates: { canonical: 'https://vidocean.xyz' },
};


export default function HomePage(){
 return <HomeClient/>
}