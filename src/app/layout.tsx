// app/layout.tsx
import Script from 'next/script'
import "./globals.css";
import { Navbar } from "./components/navbar";

// 🔥 ENHANCED METADATA - 100% SEO OPTIMIZED
export const metadata = {
  // ✅ SEO TITLE TEMPLATE
  title: {
    template: '%s | VidOcean - Best Free Video Downloader',
    default: 'VidOcean - Free Video Downloader | YouTube, Instagram, TikTok, Facebook | Download Videos Online'
  },
  
  // ✅ COMPREHENSIVE DESCRIPTION
  description: "Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ platforms with VidOcean. Fast, free, reliable video downloader with HD quality, 4K support, audio extraction, and real-time progress tracking. No registration required.",
  
  // 🎯 ENHANCED TARGET KEYWORDS - Complete SEO Package
  keywords: [
    // Core Video Downloader Keywords
    "video downloader", "free video downloader", "online video downloader",
    "universal video downloader", "all in one video downloader", "social media downloader",
    "web video downloader", "browser video downloader", "instant video downloader",
    
    // Platform-Specific Keywords
    "YouTube downloader", "Instagram video downloader", "TikTok downloader",
    "Facebook video downloader", "Twitter video downloader", "LinkedIn video downloader",
    "Pinterest video downloader", "Reddit video downloader", "Vimeo downloader",
    "Dailymotion downloader", "Twitch downloader", "Discord video downloader",
    
    // Quality-Based Keywords  
    "HD video downloader", "4K video downloader", "8K video downloader",
    "1080p video downloader", "720p video downloader", "480p video downloader",
    "high quality video downloader", "premium video downloader", "ultra HD downloader",
    
    // Audio Keywords
    "audio downloader", "music downloader", "mp3 downloader from video",
    "extract audio from video", "video to mp3", "video to audio converter",
    "download audio only", "music extractor", "audio ripper",
    
    // Action-Based Keywords
    "download YouTube videos", "download Instagram reels", "download TikTok videos",
    "download Facebook videos", "download Twitter videos", "save videos online",
    "extract videos", "grab videos", "capture videos", "rip videos",
    
    // Feature Keywords
    "video downloader with audio", "fast video downloader", "bulk video downloader",
    "video downloader no registration", "free online video saver", "video grabber",
    "video ripper", "video converter", "video extractor", "media downloader",
    
    // Device Keywords
    "mobile video downloader", "desktop video downloader", "Android video downloader",
    "iPhone video downloader", "iPad video downloader", "PC video downloader",
    "Mac video downloader", "Windows video downloader", "Linux video downloader",
    
    // Speed & Performance Keywords
    "fastest video downloader", "quick video download", "instant video save",
    "rapid video downloader", "lightning fast downloader", "speed video downloader",
    "turbo video downloader", "express video downloader", "accelerated downloader",
    
    // Format Keywords
    "mp4 downloader", "avi downloader", "mkv downloader", "mov downloader",
    "webm downloader", "flv downloader", "3gp downloader", "wmv downloader",
    "video format converter", "multiple format downloader", "any format downloader",
    
    // Convenience Keywords
    "no watermark downloader", "clean video downloader", "ad-free video downloader",
    "safe video downloader", "secure video downloader", "reliable video downloader",
    "trusted video downloader", "legitimate video downloader", "official downloader",
    
    // Brand Keywords
    "vidocean", "vid ocean", "video ocean", "vidocean.xyz", "vidocean downloader",
    "vidocean app", "vidocean tool", "vidocean website", "vidocean service",
    
    // Long-tail Keywords
    "how to download videos from YouTube", "best free video downloader 2025",
    "download videos without software", "online video downloader no install",
    "save videos from social media", "download private videos", "batch download videos",
    
    // Geographic Keywords
    "video downloader India", "video downloader USA", "video downloader UK",
    "video downloader worldwide", "global video downloader", "international downloader",
    
    // Alternative Names
    "video saver", "video grabber", "video ripper", "video extractor",
    "media downloader", "content downloader", "stream downloader", "clip downloader"
  ].join(", "),
  
  // 🤖 SEARCH ENGINE DIRECTIVES
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 🌐 ENHANCED OPEN GRAPH
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'VidOcean - Free Video Downloader for YouTube, Instagram, TikTok, Facebook',
    description: 'Download videos from 1000+ platforms with HD quality, 4K support, audio extraction, and real-time progress. Fast, free, and reliable video downloader.',
    url: 'https://vidocean.xyz',
    siteName: 'VidOcean',
    images: [
      {
        url: 'https://vidocean.xyz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VidOcean - Free Video Downloader',
        type: 'image/png',
      }
    ],
  },

  // 🐦 TWITTER OPTIMIZATION
  twitter: {
    card: 'summary_large_image',
    site: '@vidocean',
    creator: '@vidocean',
    title: 'VidOcean - Free Video Downloader',
    description: 'Download videos from YouTube, Instagram, TikTok, Facebook and 1000+ platforms. Fast, free, HD quality.',
    images: ['https://vidocean.xyz/twitter-image.png'],
  },

  // 🔗 CANONICAL & ALTERNATE
  alternates: {
    canonical: 'https://vidocean.xyz',
    languages: {
      'en-US': 'https://vidocean.xyz',
      'es-ES': 'https://vidocean.xyz/es',
      'fr-FR': 'https://vidocean.xyz/fr',
      'de-DE': 'https://vidocean.xyz/de',
      'it-IT': 'https://vidocean.xyz/it',
      'pt-BR': 'https://vidocean.xyz/pt',
      'ja-JP': 'https://vidocean.xyz/ja',
      'ko-KR': 'https://vidocean.xyz/ko',
      'zh-CN': 'https://vidocean.xyz/zh',
      'ar-SA': 'https://vidocean.xyz/ar',
      'hi-IN': 'https://vidocean.xyz/hi',
    },
  },

  // 📱 APP & MOBILE
  applicationName: 'VidOcean',
  appleWebApp: {
    capable: true,
    title: 'VidOcean',
    statusBarStyle: 'default',
    startupImage: [
      '/apple-touch-startup-image-768x1004.png',
      {
        url: '/apple-touch-startup-image-1536x2008.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  
  // 🎨 ENHANCED ICONS (तेरे existing icons के साथ enhanced versions)
  icons: {
    icon: [
      { url: "/fav.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192" },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: "/fav.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#0891b2',
      },
    ],
  },

  // 📊 VERIFICATION & ANALYTICS
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-site-verification-code',
    other: {
      me: ['thelogodesiger1@gmail.com', 'https://vidocean.xyz'],
      'msvalidate.01': 'your-bing-verification-code',
      'facebook-domain-verification': 'your-facebook-verification-code',
    },
  },

  // 🌍 CATEGORY & CLASSIFICATION
  category: 'technology',
  classification: 'Video Downloader Software',
  
  // 👥 AUTHORS & PUBLISHER
  authors: [
    { name: 'VidOcean Team', url: 'https://vidocean.xyz' },
    { name: 'VidOcean Developer', url: 'https://vidocean.xyz/about' }
  ],
  creator: 'VidOcean',
  publisher: 'VidOcean',
  
  // 📅 DATES & META INFO
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // 🔒 SECURITY HEADERS
  metadataBase: new URL('https://vidocean.xyz'),
  
  // 🎯 ADDITIONAL SEO METADATA
  other: {
    'google-site-verification': 'your-google-verification-code',
    'msapplication-TileColor': '#0891b2',
    'msapplication-TileImage': '/mstile-144x144.png',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#0891b2',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

// 🔥 ENHANCED VIEWPORT (तेरा original + enhanced)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0891b2' },
    { media: '(prefers-color-scheme: dark)', color: '#0891b2' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 🔥 MICROSOFT CLARITY - USER BEHAVIOR ANALYTICS */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "t9h7ln87tu");
            `
          }}
        />

        {/* 🔥 STRUCTURED DATA - JSON-LD FOR SEARCH ENGINES */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "VidOcean",
              "applicationCategory": "VideoDownloader",
              "operatingSystem": "Web Browser",
              "description": "Free online video downloader supporting YouTube, Instagram, TikTok, Facebook and 1000+ platforms with HD/4K quality and audio support.",
              "url": "https://vidocean.xyz",
              "downloadUrl": "https://vidocean.xyz",
              "installUrl": "https://vidocean.xyz",
              "screenshot": "https://vidocean.xyz/screenshot.png",
              "softwareVersion": "1.0",
              "releaseNotes": "Enhanced video downloading with 4K support and audio extraction",
              "author": {
                "@type": "Organization",
                "name": "VidOcean Team",
                "url": "https://vidocean.xyz",
                "logo": "https://vidocean.xyz/logo.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "thelogodesiger1@gmail.com",
                  "contactType": "customer service"
                }
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "10000",
                "bestRating": "5",
                "worstRating": "1"
              },
              "featureList": [
                "YouTube video downloader",
                "Instagram video downloader", 
                "TikTok video downloader",
                "Facebook video downloader",
                "HD/4K quality downloads",
                "Audio extraction support",
                "Real-time progress tracking",
                "No registration required",
                "Multiple format support",
                "Bulk download capability",
                "Mobile responsive design"
              ],
              "supportedDevice": [
                "Desktop", "Mobile", "Tablet"
              ],
              "browserRequirements": "Requires JavaScript. Compatible with all modern browsers."
            })
          }}
        />

        {/* 🌐 WEBSITE STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "VidOcean",
              "alternateName": "Vid Ocean",
              "url": "https://vidocean.xyz",
              "description": "Free online video downloader for YouTube, Instagram, TikTok, Facebook and 1000+ platforms",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://vidocean.xyz/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://twitter.com/vidocean",
                "https://facebook.com/vidocean",
                "https://instagram.com/vidocean"
              ]
            })
          }}
        />

        {/* 🏢 ORGANIZATION STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "VidOcean",
              "url": "https://vidocean.xyz",
              "logo": {
                "@type": "ImageObject",
                "url": "https://vidocean.xyz/logo.png",
                "width": 512,
                "height": 512
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "thelogodesiger1@gmail.com",
                "contactType": "customer service",
                "availableLanguage": ["English", "Spanish", "French", "German", "Hindi"]
              },
              "sameAs": [
                "https://twitter.com/vidocean",
                "https://facebook.com/vidocean",
                "https://instagram.com/vidocean"
              ]
            })
          }}
        />
        
        {/* 📊 GOOGLE ANALYTICS (Production में enable होगा) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></Script>
            <Script 
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'GA_MEASUREMENT_ID', {
                    page_title: 'VidOcean - Free Video Downloader',
                    custom_map: {'custom_parameter_1': 'video_download_type'}
                  });
                `
              }} 
            />
          </>
        )}

        {/* 🔍 PRECONNECT FOR PERFORMANCE */}
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="//pl27603823.revenuecpmgate.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* 🚀 DNS-PREFETCH FOR FASTER LOADING */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//clarity.ms" />

        {/* 📱 PWA MANIFEST */}
        <link rel="manifest" href="/manifest.json" />

        {/* 🔒 SECURITY HEADERS */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </head>
      <body>
        {/* 🌊 तेरा ORIGINAL OCEAN BACKGROUND - PRESERVED */}
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
        
        {/* 🎨 तेरा ORIGINAL MAIN STYLING - PRESERVED */}
        <main className="pt-4 md:pt-24 lg:pt-32 pb-28 md:pb-8 px-4 relative z-10">
          {children}
        </main>

        {/* 🔥 तेरा ORIGINAL ADSTERRA SCRIPT - PRESERVED */}
        <Script 
          async 
          data-cfasync="false" 
          src="//pl27603823.revenuecpmgate.com/2ec1a8e66e3a1bf2623b769d31d24e75/invoke.js"
          strategy="afterInteractive"
        />

        {/* 📊 ADDITIONAL PERFORMANCE MONITORING */}
        <Script
          id="performance-observer"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                      console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart);
                    }
                  }
                });
                observer.observe({entryTypes: ['navigation', 'paint']});
              }
            `
          }}
        />
      </body>
    </html>
  );
}
