"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Download,
  Youtube,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Play,
  Clock,
  Eye,
  Heart,
  User,
  FileDown,
  Info,
  Video,
  Music,
  Star,
  Sparkles,
  Activity,
  Timer,
  HardDrive,
  Wifi,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Monitor,
  Headphones,
  X,
  Cookie,
} from "lucide-react";

/* ========= ADSTERRA CONFIG (Updated with your Native Banner code) ========= */
const AD_SRC =
  "//pl27603823.revenuecpmgate.com/2ec1a8e66e3a1bf2623b769d31d24e75/invoke.js";
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
  style = {},
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
      style={{
        width: "100%",
        minHeight,
        border: 0,
        background: "transparent",
        ...style,
      }}
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
  return <AdIFrame minHeight={minHeight} className={className} style={style} />;
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
        <div className="ad-container bg-gradient-to-r from-red-900/20 to-pink-900/20 backdrop-blur-md rounded-xl border border-red-400/30 p-4 cursor-pointer hover:from-red-800/30 hover:to-pink-800/30 transition-all duration-300 shadow-lg">
          <div className="text-center">
            <div className="mt-4">
              <AdIFrame minHeight={90} />
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-900 text-sm font-bold">🚀</span>
              </div>
              <span className="text-white font-bold text-sm">
                Click Here to Download
              </span>
            </div>
            <p className="text-red-200 text-xs mt-2">
              Click Here For Real Download{" "}
            </p>
          </div>
        </div>
      </div>

      {/* Actual Adsterra Banner - Separate & Visible */}
    </>
  );
};

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
  error?: string;
}

interface LinkDetails {
  title: string;
  thumbnail: string;
  author: string;
  duration?: string;
  viewCount?: string;
  platform: string;
  type: string;
  description?: string;
}

export default function YouTubePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingFormats, setFetchingFormats] = useState(false);
  const [linkDetails, setLinkDetails] = useState<LinkDetails | null>(null);
  const [availableFormats, setAvailableFormats] =
    useState<FormatResponse | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  // Ad visibility state
  const [inputAdVisible, setInputAdVisible] = useState(false);
  const [downloadAdVisible, setDownloadAdVisible] = useState(false);
  const [heroAdVisible, setHeroAdVisible] = useState(false);
  const [inputAdClicked, setInputAdClicked] = useState(false);
  const [downloadAdClicked, setDownloadAdClicked] = useState(false);
  const [heroAdClicked, setHeroAdClicked] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

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

  const detectYouTubeType = (url: string): string => {
    if (!url) return "unknown";
    const cleanUrl = url.toLowerCase();

    if (cleanUrl.includes("/shorts/")) return "short";
    if (cleanUrl.includes("watch?v=") || cleanUrl.includes("youtu.be/"))
      return "video";
    if (cleanUrl.includes("/playlist")) return "playlist";

    return "video"; // default
  };

  const isYouTubeUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return (
        url.hostname.includes("youtube.com") ||
        url.hostname.includes("youtu.be")
      );
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
    if (url && isYouTubeUrl(url)) {
      // 🔥 FIXED: Faster delay for YouTube
      const timeoutId = setTimeout(() => {
        fetchAvailableFormats(url);
      }, 500); // Reduced from 1500ms to 500ms
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

  // 🔥 FIXED: fetchAvailableFormats function
  const fetchAvailableFormats = async (videoUrl: string) => {
    setFetchingFormats(true);
    setError("");

    // Clear previous states
    setAvailableFormats(null);
    setSelectedFormat("");
    setLinkDetails(null);

    try {
      const response = await fetch(
        `/api/list-formats?url=${encodeURIComponent(videoUrl)}`
      );
      const data: FormatResponse = await response.json();

      if (data.success) {
        // Force state update with timeout
        setTimeout(() => {
          setAvailableFormats(data);

          const contentType = detectYouTubeType(videoUrl);

          setLinkDetails({
            title: data.title || "YouTube Video",
            author: data.uploader || "YouTube Creator",
            duration: data.duration,
            viewCount: data.view_count,
            platform: "youtube",
            type: contentType,
            thumbnail:
              data.thumbnail ||
              `https://img.youtube.com/vi/${extractVideoId(
                videoUrl
              )}/maxresdefault.jpg`,
          });

          // 🔥 FIXED: Always use all formats for YouTube
          if (data.formats?.length > 0) {
            setSelectedFormat(data.formats[0].format_id);
          }
        }, 100);
      } else {
        setError(
          data.error ||
            "Could not analyze YouTube content. Video may be private, deleted, or restricted."
        );
        setAvailableFormats(null);
      }
    } catch (err: any) {
      setError(
        "Failed to analyze YouTube content. Please check the URL and ensure the video is public."
      );
      setAvailableFormats(null);
    } finally {
      setFetchingFormats(false);
    }
  };

  const extractVideoId = (url: string): string => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/
    );
    return match ? match[1] : "";
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
      setError("Please enter a valid YouTube URL");
      return;
    }

    if (!isYouTubeUrl(url.trim())) {
      setError("Please enter a valid YouTube URL (videos or shorts)");
      return;
    }

    if (!selectedFormat && availableFormats) {
      setError("Please select a format to download");
      return;
    }

    setLoading(true);
    setError("");
    setDownloadProgress(null);

    try {
      const response = await fetch("/api/universal-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          platform: "youtube",
          formatId: selectedFormat || "best",
        }),
      });

      const data = await response.json();

      if (data.success && data.downloadId) {
        setDownloadId(data.downloadId);
        startProgressTracking(data.downloadId);
      } else {
        setError(
          data.error ||
            "YouTube download failed to start. Video may be private or unavailable."
        );
        setLoading(false);
      }
    } catch (err: any) {
      setError(`YouTube download failed: ${err.message}`);
      setLoading(false);
    }
  };

  const startProgressTracking = (downloadId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `/api/download-progress?id=${downloadId}`
    );
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
          setError(progress.error || "YouTube download failed");
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

  const handleCopyUrl = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "short":
        return <Smartphone className="text-red-400" size={16} />;
      case "playlist":
        return <Music className="text-purple-400" size={16} />;
      default:
        return <Video className="text-blue-400" size={16} />;
    }
  };

  const formatNumber = (num: number | string) => {
    const number =
      typeof num === "string" ? parseInt(num.replace(/,/g, "")) : num;
    if (number >= 1000000) return (number / 1000000).toFixed(1) + "M";
    if (number >= 1000) return (number / 1000).toFixed(1) + "K";
    return number?.toString();
  };

  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <div className="w-full bg-black/40 rounded-full h-2.5 sm:h-3 overflow-hidden border border-red-300/20">
      <div
        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );

  // 🔥 FIXED: Always show ALL YouTube formats
  const getFormatsToDisplay = () => {
    if (!availableFormats?.success) {
      return [];
    }

    // Always show all formats for YouTube
    return availableFormats.formats || [];
  };

  const formatsToDisplay = getFormatsToDisplay();

  return (
    <>
      {/* Cookie Popup */}
      {showCookiePopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-3 sm:p-4">
          <div className="animate-slide-up w-full max-w-2xl">
            <GlassCard
              variant="strong"
              className="w-full p-4 sm:p-6 border-l-0 sm:border-l-4 border-l-red-400 relative"
            >
              <button
                onClick={handleCookieDecline}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <Cookie className="text-white" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    🍪 We Value Your Privacy
                  </h3>
                  <p className="text-red-200 mb-4 leading-relaxed text-sm sm:text-base">
                    vidocean uses cookies to enhance your YouTube downloading
                    experience and improve our service.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleCookieAccept}
                      className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-100 sm:hover:scale-[1.02] flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      <CheckCircle size={16} />
                      <span>Accept All</span>
                    </button>
                    <button
                      onClick={handleCookieDecline}
                      className="flex-1 py-2.5 sm:py-3 bg-gray-600/50 text-white font-medium rounded-lg hover:bg-gray-600/70 transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-500/30 text-sm sm:text-base"
                    >
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
        {/* SEO-Optimized Hero Section */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="mb-4 sm:mb-6">
            <Youtube
              className="mx-auto mb-3 sm:mb-4 text-red-400 animate-pulse"
              size={48}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent leading-tight md:leading-[1.1]">
            YouTube Video & Shorts Downloader
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Download{" "}
            <span className="text-red-400 font-bold">YouTube Videos</span>,
            <span className="text-pink-400 font-bold"> YouTube Shorts</span>,
            and
            <span className="text-blue-400 font-bold"> Audio</span> in high
            quality with guaranteed audio! Free YouTube downloader supporting
            all video types with real-time progress tracking and multiple
            quality options.
          </p>

          {/* ===== LEADERBOARD UNDER TAGLINE (desktop/tablet only) ===== */}
          <div className="hidden sm:block mb-6">
            <AdSlot slot="UNDER_TAGLINE" minHeight={90} />
          </div>

          {/* SEO Benefits */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
            <span className="bg-red-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-red-300 flex items-center space-x-1 sm:space-x-2">
              <Video size={14} />
              <span>YouTube Videos</span>
            </span>
            <span className="bg-pink-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-pink-300 flex items-center space-x-1 sm:space-x-2">
              <Smartphone size={14} />
              <span>YouTube Shorts</span>
            </span>
            <span className="bg-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-blue-300 flex items-center space-x-1 sm:space-x-2">
              <Music size={14} />
              <span>Audio Only</span>
            </span>
            <span className="bg-green-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-green-300 flex items-center space-x-1 sm:space-x-2">
              <Sparkles size={14} />
              <span>100% Free</span>
            </span>
          </div>
        </div>

        {/* Hero overlay ad */}
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

        {/* YouTube Download Interface */}
        <div className="max-w-4xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <GlassCard
            variant="strong"
            className="p-4 sm:p-6 md:p-8 border-l-0 md:border-l-4 border-l-red-400"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-3 sm:mb-4">
                <Youtube className="text-white" size={20} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                Professional YouTube Downloader
              </h2>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg px-2">
                Advanced format selection • Real-time progress • Supports
                YouTube videos, shorts, and audio downloads
              </p>
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

                <div
                  className="relative"
                  style={{ zIndex: inputAdVisible ? 5 : "auto" }}
                >
                  <input
                    type="url"
                    placeholder="Paste YouTube URL: Videos, Shorts, or Playlists (e.g., youtube.com/watch?v=... or youtube.com/shorts/...)"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-4 pr-20 sm:pr-24 rounded-lg md:rounded-xl bg-black/40 border border-red-300/20 text-white placeholder-red-200/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base sm:text-lg transition-all duration-300"
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-1 sm:gap-2">
                    {fetchingFormats && (
                      <Loader2
                        className="animate-spin text-red-400"
                        size={18}
                      />
                    )}
                    {url && (
                      <button
                        onClick={() => {
                          setUrl("");
                          setInputAdVisible(false);
                        }}
                        className="text-red-300/60 hover:text-white transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              {linkDetails && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-red-400/30">
                  <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-6">
                    <div className="relative flex-shrink-0">
                      <img
                        src={linkDetails.thumbnail}
                        alt={linkDetails.title}
                        className="w-24 h-18 sm:w-28 sm:h-21 md:w-32 md:h-24 rounded-lg md:rounded-xl object-cover border border-red-300/30"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://img.youtube.com/vi/${extractVideoId(
                            url
                          )}/hqdefault.jpg`;
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
                      <h3 className="text-white font-semibold text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 line-clamp-2">
                        {linkDetails.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs md:text-sm text-red-200">
                        <div className="flex items-center space-x-1">
                          <Youtube size={14} className="text-red-400" />
                          <span>YouTube</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getContentIcon(linkDetails.type)}
                          <span className="capitalize">
                            {linkDetails.type === "short"
                              ? "YouTube Short"
                              : "YouTube Video"}
                          </span>
                        </div>
                        {linkDetails.author && (
                          <div className="flex items-center space-x-1">
                            <User size={14} />
                            <span className="truncate max-w-24 sm:max-w-32">
                              {linkDetails.author}
                            </span>
                          </div>
                        )}
                        {linkDetails.viewCount && (
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>
                              {formatNumber(linkDetails.viewCount)} views
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Type Detection */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-red-400/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className="text-red-300 font-medium text-sm">
                          Content Type:
                        </span>
                        <div className="flex items-center space-x-2">
                          {getContentIcon(linkDetails.type)}
                          <span className="text-white capitalize text-sm">
                            {linkDetails.type === "short"
                              ? "YouTube Short (Vertical Video)"
                              : "YouTube Video"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-blue-200">
                        {linkDetails.type === "short" && (
                          <span className="bg-pink-500/20 px-2 py-1 rounded-full text-pink-300">
                            📱 Mobile Optimized
                          </span>
                        )}
                        <span className="bg-green-500/20 px-2 py-1 rounded-full text-green-300">
                          🎵 Audio Included
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* 🔥 FIXED: Format Selection - Always show ALL formats */}
              {formatsToDisplay.length > 0 && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-red-400/30 overscroll-contain">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                    <Star className="text-red-400" size={18} />
                    <h3 className="text-red-200 font-bold text-sm sm:text-base md:text-lg">
                      Choose Quality & Format
                    </h3>
                    <span className="text-[10px] sm:text-xs bg-red-500/20 px-2 sm:px-3 py-1 rounded-full text-red-300">
                      {formatsToDisplay.length} options available
                    </span>
                    <span className="text-[10px] sm:text-xs bg-blue-500/20 px-2 py-1 rounded-full text-blue-300">
                      ▶️ All YouTube Formats
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-red-500/50 scrollbar-track-transparent">
                    {formatsToDisplay.map((format, index) => (
                      <label
                        key={`${format.format_id}-${index}`}
                        className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-white/5 cursor-pointer border border-red-300/20 transition-all"
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.format_id}
                          checked={selectedFormat === format.format_id}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="text-red-400 focus:ring-red-500 w-4 h-4 flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {format.type === "audio" ? (
                              <Headphones
                                size={14}
                                className="text-green-400"
                              />
                            ) : format.type === "video" ? (
                              <Monitor size={14} className="text-blue-400" />
                            ) : (
                              <Play size={14} className="text-purple-400" />
                            )}
                            <span className="text-white font-medium text-sm sm:text-base">
                              {format.quality} {format.ext.toUpperCase()}
                            </span>
                            {format.isRecommended && (
                              <span className="text-[10px] sm:text-xs bg-green-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-green-300">
                                ⭐ Recommended
                              </span>
                            )}
                            <span className="text-[10px] sm:text-xs bg-gray-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-gray-300">
                              {format.format_id}
                            </span>
                          </div>
                          <div className="text-red-200 text-[11px] sm:text-xs md:text-sm">
                            <span className="truncate max-w-[70%] sm:max-w-none">
                              {format.type}
                            </span>{" "}
                            •
                            <span className="font-bold text-cyan-300">
                              {format.filesizeMB > 0
                                ? ` ${format.filesizeMB}MB`
                                : ` ${format.filesize}`}
                            </span>
                            {format.fps && <span> • {format.fps}fps</span>}
                            {format.type === "video" && (
                              <span className="text-green-300">
                                {" "}
                                • Audio included
                              </span>
                            )}
                            {format.type === "audio" && (
                              <span className="text-yellow-300">
                                {" "}
                                • Audio only download
                              </span>
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
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-red-400/30">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="animate-spin text-red-400" size={20} />
                    <span className="text-red-200 text-sm sm:text-base md:text-lg text-center">
                      Analyzing YouTube content and getting available formats...
                    </span>
                  </div>
                </GlassCard>
              )}

              {/* Progress Display */}
              {downloadProgress && (
                <GlassCard className="p-4 sm:p-5 md:p-6 border border-red-400/30">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Activity
                        className="text-red-400 flex-shrink-0"
                        size={20}
                      />
                      <h3 className="text-red-200 font-bold text-sm sm:text-base md:text-lg">
                        YouTube Download Progress
                      </h3>
                      <span className="text-[10px] sm:text-xs bg-red-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-red-300 capitalize">
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
                            <span className="text-xs sm:text-sm">
                              {downloadProgress.speed}
                            </span>
                          </div>
                        )}
                      </div>

                      <ProgressBar percentage={downloadProgress.percentage} />

                      <div className="flex justify-between items-center text-[11px] sm:text-sm text-red-200">
                        {downloadProgress.downloaded &&
                          downloadProgress.totalSize && (
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <HardDrive size={12} />
                              <span>
                                {downloadProgress.downloaded} of{" "}
                                {downloadProgress.totalSize}
                              </span>
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
                      <div className="bg-red-500/20 rounded-lg p-3 sm:p-4">
                        <p className="text-red-200 text-sm">
                          {downloadProgress.message}
                        </p>
                      </div>
                    )}

                    {downloadProgress.status === "completed" && (
                      <div className="flex items-center space-x-2 text-green-300">
                        <CheckCircle size={18} />
                        <span className="font-medium text-sm sm:text-base">
                          YouTube content downloaded successfully!
                        </span>
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
                  disabled={
                    loading ||
                    !url.trim() ||
                    (!selectedFormat && availableFormats?.formats)
                  }
                  className="w-full py-4 sm:py-5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base sm:text-lg md:text-xl rounded-lg md:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-100 md:hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 sm:space-x-3"
                  style={{ zIndex: downloadAdVisible ? 5 : "auto" }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>Processing YouTube Content...</span>
                    </>
                  ) : (
                    <>
                      <Download size={24} />
                      <span>Download YouTube Content</span>
                      <Sparkles size={20} />
                    </>
                  )}
                </button>
              </div>

              {/* Enhanced Error Display */}
              {error && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
                    <AlertCircle
                      className="text-red-300 flex-shrink-0 mt-1"
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-red-200 font-medium text-sm sm:text-base">
                        YouTube Download Error:
                      </span>
                      <p className="text-red-200 mt-1 text-sm break-words">
                        {error}
                      </p>

                      {/* Troubleshooting suggestions */}
                      <div className="mt-3 space-y-2">
                        <p className="text-red-100 text-xs sm:text-sm font-medium">
                          💡 Troubleshooting Tips:
                        </p>
                        <ul className="text-red-200 text-xs sm:text-sm space-y-1 ml-4">
                          <li>
                            • Make sure the YouTube video is public (not private
                            or unlisted)
                          </li>
                          <li>
                            • Check if the video still exists (not deleted by
                            creator)
                          </li>
                          <li>• Try copying the URL again from YouTube</li>
                          <li>
                            • Some age-restricted videos may require special
                            handling
                          </li>
                          <li>• Premium/paid content cannot be downloaded</li>
                        </ul>
                      </div>

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

                  {/* Alternative methods */}
                  <GlassCard className="p-4 bg-blue-500/10 border border-blue-400/30">
                    <h4 className="text-blue-200 font-bold mb-2 flex items-center space-x-2 text-sm sm:text-base">
                      <Info size={14} />
                      <span>Alternative Methods:</span>
                    </h4>
                    <div className="text-blue-200 text-xs sm:text-sm space-y-1">
                      <p>
                        • Try using the full YouTube URL instead of a shortened
                        link
                      </p>
                      <p>
                        • Make sure you're using the direct video URL, not a
                        playlist link
                      </p>
                      <p>
                        • For age-restricted content, the video must be publicly
                        accessible
                      </p>
                      <p>• Check if the video is available in your region</p>
                    </div>
                  </GlassCard>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ===== BIG BANNER ABOVE CONTENT SECTION ===== */}
        <div className="mb-6">
          <AdSlot slot="ABOVE_PLATFORMS" minHeight={250} />
        </div>

        {/* SEO Content Section */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
              Complete YouTube Downloader - Videos, Shorts & Audio
            </h2>
            <p className="text-base sm:text-lg text-blue-200 max-w-4xl mx-auto px-4">
              Our advanced YouTube downloader supports all types of YouTube
              content including regular videos, YouTube Shorts, playlists, and
              audio-only downloads with professional-grade features and
              guaranteed audio quality for all video content.
            </p>
          </div>

          {/* YouTube Content Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
            <GlassCard className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-red-400 hover:scale-100 sm:hover:scale-105 transition-transform duration-300">
              <Video className="mx-auto mb-3 sm:mb-4 text-red-400" size={36} />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                YouTube Videos
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                Download regular YouTube videos in HD quality with original
                audio. Perfect for tutorials, entertainment, educational
                content, and long-form videos with guaranteed audio
                synchronization and multiple quality options.
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-pink-400 hover:scale-100 sm:hover:scale-105 transition-transform duration-300">
              <Smartphone
                className="mx-auto mb-3 sm:mb-4 text-pink-400"
                size={36}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                YouTube Shorts
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                Save YouTube Shorts in their original vertical format. Perfect
                for downloading trending short-form content, viral videos, and
                mobile-optimized content with full audio and video quality
                preservation.
              </p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-green-400 hover:scale-100 sm:hover:scale-105 transition-transform duration-300">
              <Headphones
                className="mx-auto mb-3 sm:mb-4 text-green-400"
                size={36}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Audio Only Downloads
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                Extract high-quality audio from any YouTube video or short.
                Perfect for music, podcasts, interviews, and educational content
                when you only need the audio track in MP3 or M4A format.
              </p>
            </GlassCard>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          <GlassCard className="p-5 sm:p-6 md:p-8 text-center hover:scale-100 md:hover:scale-105 transition-transform duration-300">
            <Star className="mx-auto mb-3 sm:mb-4 text-yellow-400" size={40} />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">
              Multiple Quality Options
            </h3>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Download YouTube content in your preferred quality from 360p to 4K
              resolution. Choose from video+audio, video-only, or audio-only
              formats. Perfect quality selection for any device or use case.
            </p>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 md:p-8 text-center hover:scale-100 md:hover:scale-105 transition-transform duration-300">
            <Activity
              className="mx-auto mb-3 sm:mb-4 text-cyan-400"
              size={40}
            />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">
              Real-Time Progress Tracking
            </h3>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Watch your YouTube downloads progress in real-time with detailed
              statistics including download speed, estimated time remaining,
              file size, and completion percentage for complete transparency.
            </p>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6 md:p-8 text-center hover:scale-100 md:hover:scale-105 transition-transform duration-300">
            <Music className="mx-auto mb-3 sm:mb-4 text-green-400" size={40} />
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">
              Audio Quality Guaranteed
            </h3>
            <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
              Every YouTube video download includes high-quality audio
              automatically merged with video. Our advanced processing ensures
              perfect audio-video synchronization for the best viewing
              experience.
            </p>
          </GlassCard>
        </div>

        {/* How to Use Section */}
        <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            How to Download YouTube Videos & Shorts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
                1
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Copy YouTube URL
              </h4>
              <p className="text-blue-200 text-sm sm:text-base">
                Copy the URL of any YouTube video or YouTube Short from your
                browser or the YouTube mobile app. Works with all public YouTube
                content including regular videos and shorts.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
                2
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Select Quality & Format
              </h4>
              <p className="text-blue-200 text-sm sm:text-base">
                Paste the YouTube URL above and choose your preferred quality
                and format from the available options. View file size
                information and select video+audio, video-only, or audio-only
                format.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
                3
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                Download & Enjoy
              </h4>
              <p className="text-blue-200 text-sm sm:text-base">
                Click download and watch real-time progress. Your YouTube
                content will be saved directly to your device with perfect
                quality and guaranteed audio synchronization.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* FAQ Section */}
        <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            Frequently Asked Questions about YouTube Downloads
          </h2>
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            <div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                Can I download private or unlisted YouTube videos?
              </h4>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                No, this tool only works with public YouTube content. Private,
                unlisted, or age-restricted videos cannot be downloaded for
                privacy and security reasons. The YouTube video must be publicly
                accessible for downloads to work.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                What's the difference between YouTube videos and YouTube Shorts?
              </h4>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                YouTube Shorts are vertical videos up to 60 seconds long,
                optimized for mobile viewing. Regular YouTube videos are
                horizontal and can be any length. Our downloader supports both
                formats and preserves their original aspect ratios.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                What quality options are available for YouTube downloads?
              </h4>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                We provide all available quality options from YouTube, including
                4K (2160p), Full HD (1080p), HD (720p), SD (480p), and mobile
                (360p). You can also choose audio-only downloads in high-quality
                MP3 or M4A format.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                Is the audio included in YouTube video downloads?
              </h4>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                Yes! All YouTube video downloads automatically include
                high-quality audio. Our advanced processing ensures perfect
                audio-video synchronization for the best viewing experience,
                especially important for music videos and educational content.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                Can I download audio-only from YouTube videos?
              </h4>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                Absolutely! You can extract high-quality audio from any YouTube
                video or short. Perfect for music, podcasts, interviews, and
                educational content when you only need the audio track.
                Available in MP3 and M4A formats.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
                Are there any limitations on YouTube downloads?
              </h4>
              <p className="text-blue-200 text-sm sm:text-base leading-relaxed md:leading-7">
                Our YouTube downloader is completely free with no limits on the
                number of downloads. However, we only support public YouTube
                content. Premium, paid, or copyrighted content with restrictions
                cannot be downloaded.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* YouTube Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12 md:mb-16">
          <GlassCard className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-red-400">
            <CheckCircle
              className="mx-auto mb-3 sm:mb-4 text-red-400"
              size={36}
            />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Free YouTube Downloader
            </h3>
            <p className="text-blue-200 text-sm">
              Completely free YouTube video and shorts downloader with no
              limits, registration, or hidden fees.
            </p>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-green-400">
            <Sparkles
              className="mx-auto mb-3 sm:mb-4 text-green-400"
              size={36}
            />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              High Quality Downloads
            </h3>
            <p className="text-blue-200 text-sm">
              Download YouTube content in original quality up to 4K resolution
              with perfect audio synchronization.
            </p>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-blue-400">
            <Timer className="mx-auto mb-3 sm:mb-4 text-blue-400" size={36} />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              Fast & Reliable
            </h3>
            <p className="text-blue-200 text-sm">
              Quick YouTube downloads with real-time progress tracking and
              reliable download completion.
            </p>
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
        .scrollbar-thumb-red-500\/50::-webkit-scrollbar-thumb {
          background-color: rgba(239, 68, 68, 0.5);
          border-radius: 9999px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
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
          scrollbar-color: rgba(239, 68, 68, 0.5) transparent;
        }
      `}</style>
    </>
  );
}
