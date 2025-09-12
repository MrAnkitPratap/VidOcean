
"use client";

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { GlassCard } from "./ui/glass-card";
import {
  Download, Instagram, Facebook, Youtube, Sparkles, Loader2, CheckCircle, XCircle,
  Play, Waves, Eye, Clock, User, Info, Video, Music, List, RefreshCw, VolumeX,
  Activity, HardDrive, Wifi, Timer, Cookie, X, Shield, Globe, Zap, Star,
  MonitorPlay, Smartphone, Users, Headphones, Cloud, TrendingUp, Tv, Radio,
  PlayCircle, VideoIcon,
} from "lucide-react";
import OceanBackground from "./OceanBackground";

// app/page.tsx - Add this AT THE TOP



// बाकी का तेरा existing code यहाँ रहेगा - कुछ change नहीं करना


/* ========= ADSTERRA CONFIG (Updated with your Native Banner code) ========= */
const AD_SRC = "//pl27603823.revenuecpmgate.com/2ec1a8e66e3a1bf2623b769d31d24e75/invoke.js";
const ADS = {
  HERO_LEADER: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  UNDER_TAGLINE: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  IN_CARD_TOP: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  ABOVE_PLATFORMS: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  LEFT_SKYSCRAPER: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  RIGHT_SKYSCRAPER: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  MOBILE_STACK_1: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
  MOBILE_STACK_2: "container-2ec1a8e66e3a1bf2623b769d31d24e75",
};

/* ========= Native Async injector (safe for multiple placements) ========= */
const AdsterraNativeAsync = ({
  src,
  containerId,
  className = "",
  style = {},
}: {
  src: string;
  containerId: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = "";
    
    const s = document.createElement("script");
    s.async = true;
    // @ts-ignore
    s.dataset.cfasync = "false";
    s.src = src;
    
    const c = document.createElement("div");
    c.id = containerId;
    
    hostRef.current.appendChild(s);
    hostRef.current.appendChild(c);
  }, [src, containerId]);

  return <div ref={hostRef} className={className} style={style} />;
};

/* ========= Iframe fallback for safe multiple renders ========= */
const AdIFrame = ({ 
  minHeight = 250, 
  className = "", 
  style = {} 
}: { 
  minHeight?: number; 
  className?: string; 
  style?: React.CSSProperties;
}) => {
  const srcDoc = `<!doctype html><html><head>
    <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style>
    </head><body>
      <script async="async" data-cfasync="false" src="${AD_SRC}"></script>
      <div id="${ADS.HERO_LEADER}"></div>
    </body></html>`;
  
  return (
    <iframe
      srcDoc={srcDoc}
      className={className}
      style={{ width: "100%", minHeight, border: 0, background: "transparent", ...style }}
      sandbox="allow-scripts allow-popups allow-top-navigation-by-user-activation allow-same-origin"
      scrolling="no"
      loading="lazy"
    />
  );
};

/* ========= Smart ad slot (Native Async preferred, iframe fallback) ========= */
const AdSlot = ({
  slot,
  minHeight,
  className = "",
  style = {},
}: {
  slot: keyof typeof ADS;
  minHeight: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const containerId = ADS[slot];
  return (
    <AdIFrame minHeight={minHeight} className={className} style={style} />
  );
};

const SmartClickableAd = ({
  placement,
  onAdClick,
  isVisible,
  className = "",
  style = {},
}: {
  placement: string;
  onAdClick: () => void;
  isVisible: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (!isVisible) return null;

  const handleAdClick = () => {
    console.log(`Ad clicked: ${placement}`);
    onAdClick();
  };

  return (
    <>
      {/* Clickable Overlay - "Click to discover premium features" */}
      <div 
        className={`smart-ad-overlay ${className} cursor-pointer`} 
        style={style} 
        onClick={handleAdClick}
      > 
        <div className="ad-container bg-gradient-to-r from-green-900/20 to-cyan-900/20 backdrop-blur-md rounded-xl border border-green-400/30 p-4 cursor-pointer hover:from-green-800/30 hover:to-cyan-800/30 transition-all duration-300 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-900 text-sm font-bold">🚀</span>
              </div>
              <span className="text-white font-bold text-sm">Click Here to Download</span>
            </div>
            <p className="text-green-200 text-xs mt-2">Click Here For Real Download </p>
          </div>
        </div>
      </div>

      {/* Actual Adsterra Banner - Separate & Visible */}
      <div className="mt-4">
        <AdIFrame minHeight={90} />
      </div>
    </>
  );
};


/* ========= Types (unchanged) ========= */
interface DownloadProgress {
  status: "starting" | "downloading" | "processing" | "completed" | "error";
  percentage: number;
  speed?: string;
  eta?: string;
  downloaded?: string;
  totalSize?: string;
  filename?: string;
  fileSize?: number;
  error?: string;
  message?: string;
}

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  resolution: string;
  filesize: string;
  filesizeMB: number;
  fps: number | null;
  type: "video+audio" | "video" | "audio" | "unknown";
  note: string;
  isRecommended: boolean;
  acodec: string | null;
  vcodec: string | null;
}

interface FormatResponse {
  success: boolean;
  title: string;
  duration: string;
  thumbnail: string;
  uploader: string;
  view_count: string;
  formats: VideoFormat[];
  recommended: VideoFormat[];
  videoOnly: VideoFormat[];
  audioOnly: VideoFormat[];
  combined: VideoFormat[];
  error?: string;
}

interface LinkDetails {
  title: string;
  thumbnail: string;
  author: string;
  duration?: string;
  viewCount?: string;
  platform: string;
}

interface CompactPlatform {
  name: string;
  icon: string;
  count: number;
  color: string;
}

export default function HomePage() {
  /* ========= Your existing state/logic (unchanged) ========= */
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFormats, setFetchingFormats] = useState(false);
  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null);
  const [availableFormats, setAvailableFormats] = useState<FormatResponse | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  const [inputAdVisible, setInputAdVisible] = useState(false);
  const [downloadAdVisible, setDownloadAdVisible] = useState(false);
  const [heroAdVisible, setHeroAdVisible] = useState(false);
  const [inputAdClicked, setInputAdClicked] = useState(false);
  const [downloadAdClicked, setDownloadAdClicked] = useState(false);
  const [heroAdClicked, setHeroAdClicked] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const supportedPlatforms: CompactPlatform[] = [
    { name: "YouTube", icon: "Youtube", count: 1500, color: "text-red-400" },
    { name: "Instagram", icon: "Instagram", count: 1200, color: "text-pink-400" },
    { name: "TikTok", icon: "MonitorPlay", count: 1100, color: "text-cyan-400" },
    { name: "Facebook", icon: "Facebook", count: 1000, color: "text-blue-400" },
    { name: "Twitter", icon: "Globe", count: 900, color: "text-sky-400" },
    { name: "Twitch", icon: "Zap", count: 800, color: "text-purple-400" },
    { name: "Dailymotion", icon: "PlayCircle", count: 700, color: "text-orange-400" },
    { name: "Vimeo", icon: "VideoIcon", count: 600, color: "text-teal-400" },
    { name: "Reddit", icon: "Users", count: 500, color: "text-orange-500" },
    { name: "LinkedIn", icon: "Users", count: 400, color: "text-blue-600" },
    { name: "SoundCloud", icon: "Radio", count: 300, color: "text-orange-600" },
    { name: "Spotify", icon: "Music", count: 250, color: "text-green-400" },
  ];

  /* ========= Your existing effects/handlers (unchanged) ========= */
  useEffect(() => {
    const cookieConsent = localStorage.getItem("vidocean_cookie_consent");
    if (!cookieConsent) {
      setShowCookiePopup(true);
    }
    const heroTimer = setTimeout(() => {
      setUserEngaged(true);
      setHeroAdVisible(true);
    }, 3000);
    return () => clearTimeout(heroTimer);
  }, []);

  const handleInputAdClick = () => {
    setInputAdClicked(true);
    setInputAdVisible(false);
    console.log("Input ad clicked - Revenue generated!");
  };

  const handleDownloadAdClick = () => {
    setDownloadAdClicked(true);
    setDownloadAdVisible(false);
    console.log("Download ad clicked - Revenue generated!");
  };

  const handleHeroAdClick = () => {
    setHeroAdClicked(true);
    setHeroAdVisible(false);
    console.log("Hero ad clicked - Revenue generated!");
  };

  const handleCookieAccept = () => {
    localStorage.setItem("vidocean_cookie_consent", "accepted");
    setShowCookiePopup(false);
  };

  const handleCookieDecline = () => {
    localStorage.setItem("vidocean_cookie_consent", "declined");
    setShowCookiePopup(false);
  };

  const detectPlatform = (url: string): string => {
    if (!url) return "unknown";
    const cleanUrl = url.toLowerCase().trim();
    if (cleanUrl.includes("instagram.com")) return "instagram";
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) return "youtube";
    if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.watch")) return "facebook";
    if (cleanUrl.includes("tiktok.com")) return "tiktok";
    if (cleanUrl.includes("twitter.com") || cleanUrl.includes("x.com")) return "twitter";
    if (cleanUrl.includes("twitch.tv")) return "twitch";
    return "universal";
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl.length > 10 && !inputAdClicked && userEngaged) {
      setTimeout(() => {
        setInputAdVisible(true);
      }, 1000);
    }
  };

  const handleInputFocus = () => {
    if (!inputAdClicked && userEngaged) {
      setInputAdVisible(true);
    }
  };

  useEffect(() => {
    if (url && isValidUrl(url)) {
      const platform = detectPlatform(url);
      const delay = platform === "youtube" ? 300 : platform === "facebook" ? 800 : 1200;
      const timeoutId = setTimeout(() => {
        fetchAvailableFormats(url);
      }, delay);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailableFormats(null);
      setSelectedFormat("");
      setError("");
      setLinkDetails(null);
    }
  }, [url]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchAvailableFormats = async (videoUrl: string) => {
    setFetchingFormats(true);
    setError("");
    setAvailableFormats(null);
    setSelectedFormat("");
    setLinkDetails(null);

    const platform = detectPlatform(videoUrl);

    try {
      const response = await fetch(`/api/list-formats?url=${encodeURIComponent(videoUrl)}`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: FormatResponse = await response.json();

      if (data.success) {
        setAvailableFormats(data);

        setLinkDetails({
          title: data.title,
          author: data.uploader,
          duration: data.duration,
          viewCount: data.view_count,
          platform: platform,
          thumbnail: data.thumbnail || `https://via.placeholder.com/300x200?text=${platform}`,
        });

        const allFormats = data.formats || [];
        const recommendedFormats = data.recommended || [];

        let formatToSelect = "";

        if (platform === "youtube") {
          if (allFormats.length > 0) {
            formatToSelect = allFormats[0].format_id;
          }
        } else {
          if (recommendedFormats.length > 0) {
            formatToSelect = recommendedFormats[0].format_id;
          } else if (allFormats.length > 0) {
            formatToSelect = allFormats[0].format_id;
          }
        }

        if (formatToSelect) {
          setSelectedFormat(formatToSelect);
        }
      } else {
        setError(data.error || "Could not get available formats");
        setAvailableFormats(null);
      }
    } catch (err: any) {
      setError(`Failed to get format information: ${err.message}`);
      setAvailableFormats(null);
    } finally {
      setFetchingFormats(false);
    }
  };

  const handleDownloadClick = () => {
    if (!downloadAdClicked && userEngaged) {
      setDownloadAdVisible(true);
      setTimeout(() => {
        setDownloadAdVisible(false);
        handleDownload();
      }, 2000);
    } else {
      handleDownload();
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    if (!selectedFormat) {
      setError("Please select a format to download");
      return;
    }

    setLoading(true);
    setError("");
    setDownloadProgress(null);

    try {
      const platform = detectPlatform(url.trim());
      const response = await fetch("/api/universal-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          platform,
          formatId: selectedFormat,
        }),
      });

      const data = await response.json();

      if (data.success && data.downloadId) {
        setDownloadId(data.downloadId);
        startProgressTracking(data.downloadId);
      } else {
        setError(data.error || "Download failed to start");
        setLoading(false);
      }
    } catch (err: any) {
      setError(`Download failed: ${err.message}`);
      setLoading(false);
    }
  };

  const startProgressTracking = (downloadId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/download-progress?id=${downloadId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const progress: DownloadProgress = JSON.parse(event.data);
        setDownloadProgress(progress);

        if (progress.status === "completed") {
          setLoading(false);
          eventSource.close();

          if (progress.filename) {
            const downloadLink = document.createElement("a");
            downloadLink.href = `/api/download-file?filename=${progress.filename}`;
            downloadLink.download = progress.filename;
            downloadLink.style.display = "none";

            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          }
        } else if (progress.status === "error") {
          setLoading(false);
          setError(progress.error || "Download failed");
          eventSource.close();
        }
      } catch (parseError) {
        console.error("Progress parse error:", parseError);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Progress tracking error:", error);
      setLoading(false);
      setError("Connection lost. Please try again.");
      eventSource.close();
    };
  };

  const getPlatformIcon = (platform: string) => {
    const iconMap = {
      instagram: Instagram,
      youtube: Youtube,
      facebook: Facebook,
      tiktok: MonitorPlay,
      twitter: Globe,
      twitch: Zap,
      default: Play,
    };
    const IconComponent = iconMap[platform as keyof typeof iconMap] || iconMap.default;
    return <IconComponent className="text-cyan-400" size={16} />;
  };

  const getFormatIcon = (format: VideoFormat) => {
    const hasAudio = format.acodec && format.acodec !== "none" && format.acodec !== null;

    if (format.type === "audio") return <Music size={14} className="text-green-400" />;
    if (format.type === "video") return <Video size={14} className="text-blue-400" />;
    if (format.type === "video+audio" || hasAudio) return <Play size={14} className="text-purple-400" />;

    return <Download size={14} className="text-gray-400" />;
  };

  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <div className="w-full bg-black/40 rounded-full h-2.5 sm:h-3 overflow-hidden border border-blue-300/20">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );

  const getFormatsToDisplay = () => {
    if (!availableFormats || !availableFormats.success) {
      return [];
    }

    const platform = detectPlatform(url);
    const allFormats = availableFormats.formats || [];
    const recommendedFormats = availableFormats.recommended || [];

    if (platform === "youtube") {
      return allFormats;
    }

    return recommendedFormats.length > 0 ? recommendedFormats : allFormats;
  };

  const formatsToDisplay = getFormatsToDisplay();

  return (
    <>
      {/* SEO Head (unchanged) */}
      <Head>
        <title>vidocean - Universal Video Downloader | Download Videos from 1000+ Websites</title>
        <meta name="description" content="Download videos from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ other platforms with vidocean. Fast, reliable downloads with multiple format options and real-time progress tracking." />
        <meta name="keywords" content="vidocean, video downloader, YouTube downloader, Instagram video download, TikTok downloader, Facebook video downloader, Twitter video, universal video downloader, download videos online" />
        <meta name="author" content="vidocean" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vidocean.com/" />
        <meta property="og:title" content="vidocean - Universal Video Downloader" />
        <meta property="og:description" content="Download videos quickly from YouTube, Instagram, TikTok, Facebook, Twitter and 1000+ platforms with format selection and live progress tracking." />
        <meta property="og:image" content="https://vidocean.com/og-image.png" />
        <meta property="og:site_name" content="vidocean" />
        <meta property="og:locale" content="en_US" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://vidocean.com/" />
        <meta property="twitter:title" content="vidocean - Universal Video Downloader" />
        <meta property="twitter:description" content="Fast video downloads from 1000+ platforms with format selection and real-time progress." />
        <meta property="twitter:image" content="https://vidocean.com/og-image.png" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "vidocean",
              url: "https://vidocean.com",
              description: "Universal video downloader supporting 1000+ websites including YouTube, Instagram, TikTok, Facebook, Twitter and Twitch",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </Head>

      {/* Cookie Popup (unchanged) */}
      {showCookiePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-3 sm:p-4">
          <div className="animate-slide-up w-full max-w-2xl">
            <GlassCard variant="strong" className="w-full p-4 sm:p-6 border-l-0 sm:border-l-4 border-l-cyan-400 relative">
              <button onClick={handleCookieDecline} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Cookie className="text-white" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">🍪 We Value Your Privacy</h3>
                  <p className="text-blue-200 mb-4 leading-relaxed text-sm sm:text-base">vidocean uses cookies to enhance your video downloading experience and improve our service.</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button onClick={handleCookieAccept} className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-100 sm:hover:scale-[1.02] flex items-center justify-center space-x-2 text-sm sm:text-base">
                      <CheckCircle size={16} />
                      <span>Accept All</span>
                    </button>
                    <button onClick={handleCookieDecline} className="flex-1 py-2.5 sm:py-3 bg-gray-600/50 text-white font-medium rounded-lg hover:bg-gray-600/70 transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-500/30 text-sm sm:text-base">
                      <XCircle size={16} />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ===== DESKTOP FIXED SKYSCRAPERS (hidden on tablet/mobile) ===== */}
      <div className="hidden lg:block fixed left-4 top-28 z-30 w-[300px]">
        <AdSlot slot="LEFT_SKYSCRAPER" minHeight={600} />
      </div>
      <div className="hidden lg:block fixed right-4 top-28 z-30 w-[300px]">
        <AdSlot slot="RIGHT_SKYSCRAPER" minHeight={600} />
      </div>

      <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 md:px-6 overflow-x-hidden">
        <OceanBackground />

        {/* ===== HERO SECTION ===== */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="mb-4 sm:mb-6 flex items-center justify-center gap-3 sm:gap-4 mt-2">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-17 md:h-17">
              <img src="/icon.png" alt="VidOcean Logo" className="object-contain rounded-full w-full h-full" height={80} width={80} />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 blur-md"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 bg-clip-text text-transparent select-none tracking-wide">VidOcean</h1>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">Universal Video Downloader</h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-4 px-2">
            Download videos from <span className="text-red-400 font-semibold">1000+ websites</span> including{" "}
            <span className="text-red-400 font-semibold">YouTube</span>,
            <span className="text-pink-400 font-semibold"> Instagram</span>,
            <span className="text-cyan-400 font-semibold"> TikTok</span>,
            <span className="text-blue-400 font-semibold"> Facebook</span>,
            <span className="text-sky-400 font-semibold"> Twitter</span> and more
          </p>

          {/* ===== LEADERBOARD UNDER TAGLINE (desktop/tablet only) ===== */}
          <div className="hidden sm:block">
            <AdSlot slot="UNDER_TAGLINE" minHeight={90} />
          </div>
        </div>

        {/* Hero overlay ad (your existing strategy) */}
        {heroAdVisible && (
          <div className="mb-8">
            <SmartClickableAd
              placement="hero"
              onAdClick={handleHeroAdClick}
              isVisible={heroAdVisible}
              className="animate-fadeIn"
            />
          </div>
        )}

        {/* ===== MOBILE/TABLET STACKED ADS (one below another) ===== */}
        <div className="sm:hidden space-y-4 mb-6">
          <AdSlot slot="MOBILE_STACK_1" minHeight={250} />
          <AdSlot slot="MOBILE_STACK_2" minHeight={250} />
        </div>

        {/* ===== DOWNLOAD INTERFACE ===== */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-14 md:mb-16">
          <GlassCard variant="strong" className="p-4 sm:p-6 md:p-8 border-l-0 md:border-l-4 border-l-cyan-400">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-3 sm:mb-4">
                <Download className="text-white" size={20} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Professional Video Downloader</h3>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg px-2">Advanced format selection • Real-time progress • Supports 1000+ platforms</p>
            </div>

            {/* ===== IN-CARD BANNER ABOVE INPUT ===== */}
            <div className="mb-4 sm:mb-5">
              <AdSlot slot="IN_CARD_TOP" minHeight={90} />
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {/* URL Input with overlays */}
              <div className="relative">
                {inputAdVisible && (
                  <div className="absolute -top-2 left-0 right-0 z-10">
                    <SmartClickableAd
                      placement="input-overlay"
                      onAdClick={handleInputAdClick}
                      isVisible={inputAdVisible}
                      className="mb-2"
                      style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        right: "0px",
                        height: "70px",
                        zIndex: 10,
                      }}
                    />
                  </div>
                )}

                <div className="relative" style={{ zIndex: inputAdVisible ? 5 : "auto" }}>
                  <input
                    type="url"
                    placeholder="Paste video URL from any of 1000+ supported websites..."
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 pr-20 sm:pr-24 rounded-lg md:rounded-xl bg-black/40 border border-blue-300/20 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base sm:text-lg transition-all duration-300"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-1 sm:gap-2">
                    {fetchingFormats && <Loader2 className="animate-spin text-cyan-400" size={18} />}
                    {url && (
                      <button
                        onClick={() => {
                          setUrl("");
                          setInputAdVisible(false);
                        }}
                        className="text-cyan-300/60 hover:text-white transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              {linkDetails && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-cyan-400/30">
                  <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-6">
                    <div className="relative flex-shrink-0">
                      <img
                        src={linkDetails.thumbnail}
                        alt={linkDetails.title}
                        className="w-24 h-16 sm:w-28 sm:h-20 md:w-32 md:h-24 rounded-lg md:rounded-xl object-cover border border-blue-300/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/128x96?text=🎬";
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-black/50 rounded-full flex items-center justify-center">
                          <Play className="text-white ml-0.5" size={14} />
                        </div>
                      </div>
                      {linkDetails.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-white text-[10px] sm:text-xs">
                          {linkDetails.duration}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 line-clamp-2">
                        {linkDetails.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs md:text-sm text-blue-200">
                        <div className="flex items-center space-x-1">
                          {getPlatformIcon(linkDetails.platform)}
                          <span className="capitalize">{linkDetails.platform}</span>
                        </div>
                        {linkDetails.author && (
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span className="truncate max-w-24 sm:max-w-32">{linkDetails.author}</span>
                          </div>
                        )}
                        {linkDetails.viewCount && (
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{linkDetails.viewCount} views</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Format Selection */}
              {formatsToDisplay.length > 0 && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-blue-400/30 overscroll-contain">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <Star className="text-blue-400" size={18} />
                    <h4 className="text-blue-200 font-bold text-sm sm:text-base md:text-lg">Choose Quality & Format</h4>
                    <span className="text-[10px] sm:text-xs bg-blue-500/20 px-2 sm:px-3 py-1 rounded-full text-blue-300">
                      {formatsToDisplay.length} options available
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent">
                    {formatsToDisplay.map((format) => (
                      <label key={format.format_id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-white/5 cursor-pointer border border-blue-300/20 transition-all">
                        <input
                          type="radio"
                          name="format"
                          value={format.format_id}
                          checked={selectedFormat === format.format_id}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="text-blue-400 focus:ring-blue-500 w-4 h-4 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getFormatIcon(format)}
                            <span className="text-white font-medium text-sm sm:text-base">
                              {format.quality} {format.ext.toUpperCase()}
                            </span>
                            {format.isRecommended && (
                              <span className="text-[10px] sm:text-xs bg-green-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-green-300">
                                ⭐ Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-blue-200 text-[11px] sm:text-xs md:text-sm">
                            <span className="truncate max-w-[70%] sm:max-w-none">{format.type}</span> •
                            <span className="font-bold text-cyan-300">
                              {format.filesizeMB > 0 ? ` ${format.filesizeMB}MB` : ` ${format.filesize}`}
                            </span>
                            {format.fps && <span> • {format.fps}fps</span>}
                            {format.type === "video+audio" && (
                              <span className="text-green-300"> • Audio included</span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Loading State */}
              {fetchingFormats && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-blue-400/30">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="animate-spin text-blue-400" size={20} />
                    <span className="text-blue-200 text-sm sm:text-base md:text-lg text-center">
                      Analyzing video content and getting available formats...
                    </span>
                  </div>
                </GlassCard>
              )}

              {/* Progress Display */}
              {downloadProgress && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-blue-400/30">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Activity className="text-blue-400 flex-shrink-0" size={20} />
                      <h4 className="text-blue-200 font-bold text-sm sm:text-base md:text-lg">Download Progress</h4>
                      <span className="text-[10px] sm:text-xs bg-blue-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-blue-300 capitalize">
                        {downloadProgress.status}
                      </span>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-base sm:text-lg md:text-xl">
                          {downloadProgress.percentage.toFixed(1)}% Complete
                        </span>
                        {downloadProgress.speed && (
                          <div className="flex items-center space-x-1 sm:space-x-2 text-green-300">
                            <Wifi size={14} />
                            <span className="text-xs sm:text-sm">{downloadProgress.speed}</span>
                          </div>
                        )}
                      </div>

                      <ProgressBar percentage={downloadProgress.percentage} />

                      <div className="flex justify-between items-center text-[11px] sm:text-sm text-blue-200">
                        {downloadProgress.downloaded && downloadProgress.totalSize && (
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <HardDrive size={12} />
                            <span>{downloadProgress.downloaded} of {downloadProgress.totalSize}</span>
                          </div>
                        )}
                        {downloadProgress.eta && (
                          <div className="flex items-center space-x-1 sm:space-x-2 text-yellow-300">
                            <Timer size={12} />
                            <span>ETA {downloadProgress.eta}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {downloadProgress.message && (
                      <div className="bg-blue-500/20 rounded-lg p-3 sm:p-4">
                        <p className="text-blue-200 text-sm">{downloadProgress.message}</p>
                      </div>
                    )}

                    {downloadProgress.status === "completed" && (
                      <div className="flex items-center space-x-2 text-green-300">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm sm:text-base">Video downloaded successfully!</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Download Button */}
              <div className="relative">
                {downloadAdVisible && (
                  <div className="absolute -top-2 left-0 right-0 z-10">
                    <SmartClickableAd
                      placement="download-overlay"
                      onAdClick={handleDownloadAdClick}
                      isVisible={downloadAdVisible}
                      style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        right: "0px",
                        height: "70px",
                        zIndex: 10,
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={handleDownloadClick}
                  disabled={loading || !url.trim() || (!selectedFormat && formatsToDisplay.length > 0)}
                  className="w-full py-4 sm:py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base sm:text-lg md:text-xl rounded-lg md:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-100 md:hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 sm:space-x-3"
                  style={{ zIndex: downloadAdVisible ? 5 : "auto" }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Processing Video...</span>
                    </>
                  ) : (
                    <>
                      <Download size={24} />
                      <span>Download Video</span>
                      <Sparkles size={20} />
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
                    <XCircle className="text-red-300 flex-shrink-0 mt-1" size={18} />
                    <div className="flex-1 min-w-0">
                      <span className="text-red-200 font-medium text-sm sm:text-base">Download Error:</span>
                      <p className="text-red-200 mt-1 text-sm break-words">{error}</p>
                      {url && (
                        <button
                          onClick={() => fetchAvailableFormats(url)}
                          className="mt-3 text-red-300 hover:text-red-200 underline text-xs sm:text-sm flex items-center space-x-1"
                        >
                          <RefreshCw size={12} />
                          <span>Try analyzing again</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ===== BIG BANNER ABOVE "SUPPORTS 1000+ PLATFORMS" ===== */}
        <div className="mb-6">
          <AdSlot slot="ABOVE_PLATFORMS" minHeight={250} />
        </div>

        {/* ===== SUPPORTED PLATFORMS ===== */}
        <div className="mb-12 sm:mb-14 md:mb-16">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 px-2">Supports 1000+ Video Platforms</h3>
            <p className="text-blue-200 max-w-2xl mx-auto text-sm sm:text-base px-4">
              vidocean supports video downloads from virtually any video platform on the internet
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {supportedPlatforms.map((platform, index) => (
              <GlassCard key={platform.name} className="p-3 sm:p-4 text-center hover:scale-100 sm:hover:scale-105 transition-all duration-300 border border-blue-400/20">
                <div className="flex flex-col items-center space-y-1.5 sm:space-y-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/30 rounded-lg flex items-center justify-center">
                    {platform.name === "YouTube" && <Youtube className={platform.color} size={16} />}
                    {platform.name === "Instagram" && <Instagram className={platform.color} size={16} />}
                    {platform.name === "TikTok" && <MonitorPlay className={platform.color} size={16} />}
                    {platform.name === "Facebook" && <Facebook className={platform.color} size={16} />}
                    {platform.name === "Twitter" && <Globe className={platform.color} size={16} />}
                    {platform.name === "Twitch" && <Zap className={platform.color} size={16} />}
                    {platform.name === "Dailymotion" && <PlayCircle className={platform.color} size={16} />}
                    {platform.name === "Vimeo" && <VideoIcon className={platform.color} size={16} />}
                    {platform.name === "Reddit" && <Users className={platform.color} size={16} />}
                    {platform.name === "LinkedIn" && <Users className={platform.color} size={16} />}
                    {platform.name === "SoundCloud" && <Radio className={platform.color} size={16} />}
                    {platform.name === "Spotify" && <Music className={platform.color} size={16} />}
                  </div>
                  <div className="text-center">
                    <h5 className="text-white font-bold text-[12px] sm:text-sm">{platform.name}</h5>
                    <p className="text-blue-300 text-[10px] sm:text-xs">{platform.count}+ sites</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="text-center">
            <GlassCard className="inline-block p-3 sm:p-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 max-w-full">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <TrendingUp className="text-cyan-400 flex-shrink-0" size={20} />
                <div className="text-left min-w-0">
                  <h5 className="text-white font-bold text-sm sm:text-base">+ 988 More Platforms</h5>
                  <p className="text-blue-200 text-xs sm:text-sm">Including Vimeo, Dailymotion, SoundCloud, Spotify, and many more!</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-14 md:mb-16">
          <GlassCard className="p-5 sm:p-6 md:p-8 text-center hover:scale-100 md:hover:scale-105 transition-transform duration-300">
            <Star className="mx-auto mb-3 sm:mb-4 text-yellow-400" size={40} />
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Multiple Quality Options</h4>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Download videos in your preferred quality from SD to HD, 4K resolution. Choose from video+audio, video-only, or audio-only formats for any device.
            </p>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 md:p-8 text-center hover:scale-100 md:hover:scale-105 transition-transform duration-300">
            <Activity className="mx-auto mb-3 sm:mb-4 text-cyan-400" size={40} />
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Real-Time Progress Tracking</h4>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Watch your downloads progress in real-time with detailed statistics including download speed, estimated time remaining, file size, and completion percentage.
            </p>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 md:p-8 text-center hover:scale-100 md:hover:scale-105 transition-transform duration-300">
            <Music className="mx-auto mb-3 sm:mb-4 text-green-400" size={40} />
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Audio Quality Guaranteed</h4>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Every video download includes high-quality audio automatically merged with video. Our advanced processing ensures perfect audio-video synchronization.
            </p>
          </GlassCard>
        </div>

        {/* FAQ Section */}
        <GlassCard className="p-4 sm:p-6 md:p-8 mb-12 sm:mb-14 md:mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Frequently Asked Questions</h3>
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            <div>
              <h5 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">How many video platforms does vidocean support?</h5>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                vidocean supports over 1000 video platforms including YouTube, Instagram, TikTok, Facebook, Twitter, Twitch, Vimeo, Dailymotion, SoundCloud, Spotify, and many more.
              </p>
            </div>
            <div>
              <h5 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">Can I download videos in HD and 4K quality?</h5>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                Yes! vidocean provides all available quality options from the source platform, including HD (720p, 1080p) and 4K (2160p) when available. You can also choose audio-only downloads for music content.
              </p>
            </div>
            <div>
              <h5 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">Is audio included in video downloads?</h5>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                Absolutely! All video downloads automatically include high-quality audio. Our advanced processing ensures perfect audio-video synchronization for the best viewing experience.
              </p>
            </div>
            <div>
              <h5 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">Is vidocean free to use?</h5>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                Yes, vidocean is completely free to use with no limits, registration, or hidden fees. Enjoy unlimited downloads from all 1000+ supported platforms.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="text-center mb-6 sm:mb-8">
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-center justify-center space-x-2 text-blue-200/70">
              <Waves size={14} className="text-cyan-400 flex-shrink-0" />
              <span className="text-[11px] sm:text-sm text-center">
                1000+ Supported Platforms • Real-Time Progress • 100% Free • Made with 💙
              </span>
              <Waves size={14} className="text-cyan-400 flex-shrink-0" />
            </div>
          </GlassCard>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .smart-ad-overlay {
          transition: all 0.3s ease;
        }
        .smart-ad-overlay:hover {
          transform: scale(1.02);
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-blue-500\/50::-webkit-scrollbar-thumb {
          background-color: rgba(59, 130, 246, 0.5);
          border-radius: 9999px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 9999px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        html,
        body {
          overflow-x: hidden;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
        }
      `}</style>
    </>
  );
}
