"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Download,
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
  Users,
  Zap,
} from "lucide-react";

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

export default function TikTokPage() {
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
  const eventSourceRef = useRef<EventSource | null>(null);

  const detectTikTokType = (url: string): string => {
    if (!url) return "unknown";
    const cleanUrl = url.toLowerCase();

    if (cleanUrl.includes("/video/")) return "video";
    if (cleanUrl.includes("/@")) return "profile_video";
    if (cleanUrl.includes("/t/")) return "trending";

    return "video"; // default
  };

  const isTikTokUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return (
        url.hostname.includes("tiktok.com") ||
        url.hostname.includes("vm.tiktok.com")
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (url && isTikTokUrl(url)) {
      const timeoutId = setTimeout(() => {
        fetchAvailableFormats(url);
      }, 1500);
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
    try {
      const response = await fetch(
        `/api/list-formats?url=${encodeURIComponent(videoUrl)}`
      );
      const data: FormatResponse = await response.json();

      if (data.success) {
        setAvailableFormats(data);

        const contentType = detectTikTokType(videoUrl);

        setLinkDetails({
          title: data.title || "TikTok Video",
          author: data.uploader || "TikTok Creator",
          duration: data.duration,
          viewCount: data.view_count,
          platform: "tiktok",
          type: contentType,
          thumbnail:
            data.thumbnail || "https://via.placeholder.com/300x400?text=TikTok",
        });

        // Auto-select best format
        const formatsToUse =
          data.recommended?.length > 0 ? data.recommended : data.formats;
        if (formatsToUse?.length > 0) {
          setSelectedFormat(formatsToUse[0].format_id);
        }
      } else {
        setError(
          data.error ||
            "Could not analyze TikTok content. Content may be private, deleted, or restricted."
        );
        setAvailableFormats(null);
      }
    } catch (err: any) {
      setError(
        "Failed to analyze TikTok content. Please check the URL and ensure the video is public."
      );
      setAvailableFormats(null);
    } finally {
      setFetchingFormats(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a valid TikTok URL");
      return;
    }

    if (!isTikTokUrl(url.trim())) {
      setError("Please enter a valid TikTok URL (videos or profiles)");
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
          platform: "tiktok",
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
            "TikTok download failed to start. Content may be private or unavailable."
        );
        setLoading(false);
      }
    } catch (err: any) {
      setError(`TikTok download failed: ${err.message}`);
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
          setError(progress.error || "TikTok download failed");
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
      case "trending":
        return <Zap className="text-pink-400" size={16} />;
      case "profile_video":
        return <Users className="text-purple-400" size={16} />;
      default:
        return <Zap className="text-red-400" size={16} />;
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
    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-pink-300/20">
      <div
        className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4">
      {/* SEO-Optimized Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-6">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <Music className="text-white animate-pulse" size={32} />
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 via-red-400 to-pink-500 bg-clip-text text-transparent">
          TikTok Video Downloader
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
          Download{" "}
          <span className="text-pink-400 font-bold">TikTok Videos</span> without
          watermark,
          <span className="text-red-400 font-bold"> Trending Content</span>, and
          <span className="text-purple-400 font-bold"> Audio</span> in high
          quality with guaranteed sound! Free TikTok downloader supporting all
          video types with real-time progress tracking and multiple quality
          options.
        </p>

        {/* SEO Benefits */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-pink-500/20 px-4 py-2 rounded-full text-pink-300 flex items-center space-x-2">
            <Zap size={16} />
            <span>TikTok Videos</span>
          </span>
          <span className="bg-red-500/20 px-4 py-2 rounded-full text-red-300 flex items-center space-x-2">
            <Sparkles size={16} />
            <span>Trending Content</span>
          </span>
          <span className="bg-purple-500/20 px-4 py-2 rounded-full text-purple-300 flex items-center space-x-2">
            <Music size={16} />
            <span>Audio & Music</span>
          </span>
          <span className="bg-green-500/20 px-4 py-2 rounded-full text-green-300 flex items-center space-x-2">
            <Sparkles size={16} />
            <span>No Watermark</span>
          </span>
        </div>
      </div>

      {/* TikTok Download Interface */}
      <div className="max-w-4xl mx-auto mb-16">
        <GlassCard
          variant="strong"
          className="p-8 border-l-4 border-l-pink-400"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4">
              <Music className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Professional TikTok Downloader
            </h2>
            <p className="text-blue-100 text-lg">
              No watermark downloads • Real-time progress • Supports TikTok
              videos with original audio and music
            </p>
          </div>

          <div className="space-y-6">
            {/* URL Input */}
            <div className="relative">
              <input
                type="url"
                placeholder="Paste TikTok URL: Videos, Trending Content (e.g., tiktok.com/@username/video/... or vm.tiktok.com/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-black/40 border border-pink-300/20 text-white placeholder-pink-200/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg transition-all duration-300"
                disabled={loading}
              />
              {fetchingFormats && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin text-pink-400" size={20} />
                </div>
              )}
              {url && (
                <button
                  onClick={() => setUrl("")}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-pink-300/60 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>

            {/* Content Preview */}
            {linkDetails && (
              <GlassCard className="p-6 border border-pink-400/30">
                <div className="flex items-start space-x-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={linkDetails.thumbnail}
                      alt={linkDetails.title}
                      className="w-24 h-32 rounded-xl object-cover border border-pink-300/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/96x128?text=🎵";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="text-white ml-1" size={16} />
                      </div>
                    </div>
                    {linkDetails.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-white text-xs">
                        {linkDetails.duration}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                      {linkDetails.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-pink-200">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded"></div>
                        <span>TikTok</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getContentIcon(linkDetails.type)}
                        <span className="capitalize">
                          {linkDetails.type === "profile_video"
                            ? "Profile Video"
                            : linkDetails.type === "trending"
                            ? "Trending Video"
                            : "TikTok Video"}
                        </span>
                      </div>
                      {linkDetails.author && (
                        <div className="flex items-center space-x-1">
                          <User size={16} />
                          <span className="truncate max-w-32">
                            @{linkDetails.author}
                          </span>
                        </div>
                      )}
                      {linkDetails.viewCount && (
                        <div className="flex items-center space-x-1">
                          <Eye size={16} />
                          <span>
                            {formatNumber(linkDetails.viewCount)} views
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Type Detection */}
                <div className="mt-4 pt-4 border-t border-pink-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-pink-300 font-medium">
                        Content Type:
                      </span>
                      <div className="flex items-center space-x-2">
                        {getContentIcon(linkDetails.type)}
                        <span className="text-white capitalize">
                          {linkDetails.type === "profile_video"
                            ? "TikTok Profile Video"
                            : linkDetails.type === "trending"
                            ? "Trending TikTok Video"
                            : "TikTok Video"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-200">
                      <span className="bg-green-500/20 px-2 py-1 rounded-full text-green-300">
                        🚫 No Watermark
                      </span>
                      <span className="bg-purple-500/20 px-2 py-1 rounded-full text-purple-300">
                        🎵 Original Audio
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Format Selection */}
            {availableFormats?.formats &&
              availableFormats.formats.length > 0 && (
                <GlassCard className="p-6 border border-pink-400/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Star className="text-pink-400" size={20} />
                    <h3 className="text-pink-200 font-bold text-lg">
                      Choose Quality & Format
                    </h3>
                    <span className="text-xs bg-pink-500/20 px-3 py-1 rounded-full text-pink-300">
                      {availableFormats.formats.length} options available
                    </span>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {(availableFormats.recommended?.length > 0
                      ? availableFormats.recommended
                      : availableFormats.formats
                    ).map((format) => (
                      <label
                        key={format.format_id}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 cursor-pointer border border-pink-300/20 transition-all"
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.format_id}
                          checked={selectedFormat === format.format_id}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="text-pink-400 focus:ring-pink-500 w-4 h-4"
                        />

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {format.type === "audio" ? (
                              <Headphones
                                size={14}
                                className="text-green-400"
                              />
                            ) : format.type === "video" ? (
                              <Smartphone size={14} className="text-pink-400" />
                            ) : (
                              <Play size={14} className="text-purple-400" />
                            )}
                            <span className="text-white font-medium">
                              {format.quality} {format.ext.toUpperCase()}
                            </span>
                            {format.isRecommended && (
                              <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full text-green-300">
                                ⭐ Recommended
                              </span>
                            )}
                            <span className="text-xs bg-gray-500/20 px-2 py-1 rounded-full text-gray-300">
                              {format.format_id}
                            </span>
                          </div>
                          <div className="text-pink-200 text-sm">
                            {format.type} •
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
                                • Music only download
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
              <GlassCard className="p-6 border border-pink-400/30">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="animate-spin text-pink-400" size={24} />
                  <span className="text-pink-200 text-lg">
                    Analyzing TikTok content and getting available formats...
                  </span>
                </div>
              </GlassCard>
            )}

            {/* Progress Display */}
            {downloadProgress && (
              <GlassCard className="p-6 border border-pink-400/30">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="text-pink-400" size={24} />
                    <h3 className="text-pink-200 font-bold text-lg">
                      TikTok Download Progress
                    </h3>
                    <span className="text-xs bg-pink-500/20 px-3 py-1 rounded-full text-pink-300 capitalize">
                      {downloadProgress.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-xl">
                        {downloadProgress.percentage.toFixed(1)}% Complete
                      </span>
                      {downloadProgress.speed && (
                        <div className="flex items-center space-x-2 text-green-300">
                          <Wifi size={16} />
                          <span>{downloadProgress.speed}</span>
                        </div>
                      )}
                    </div>

                    <ProgressBar percentage={downloadProgress.percentage} />

                    <div className="flex justify-between items-center text-sm text-pink-200">
                      {downloadProgress.downloaded &&
                        downloadProgress.totalSize && (
                          <div className="flex items-center space-x-2">
                            <HardDrive size={14} />
                            <span>
                              {downloadProgress.downloaded} of{" "}
                              {downloadProgress.totalSize}
                            </span>
                          </div>
                        )}
                      {downloadProgress.eta && (
                        <div className="flex items-center space-x-2 text-yellow-300">
                          <Timer size={14} />
                          <span>ETA {downloadProgress.eta}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {downloadProgress.message && (
                    <div className="bg-pink-500/20 rounded-lg p-4">
                      <p className="text-pink-200">
                        {downloadProgress.message}
                      </p>
                    </div>
                  )}

                  {downloadProgress.status === "completed" && (
                    <div className="flex items-center space-x-2 text-green-300">
                      <CheckCircle size={20} />
                      <span className="font-medium">
                        TikTok video downloaded successfully without watermark!
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={
                loading ||
                !url.trim() ||
                (!selectedFormat && availableFormats?.formats)
              }
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold text-xl rounded-xl hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Processing TikTok Content...</span>
                </>
              ) : (
                <>
                  <Download size={28} />
                  <span>Download TikTok Video</span>
                  <Sparkles size={24} />
                </>
              )}
            </button>

            {/* Enhanced Error Display */}
            {error && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
                  <AlertCircle
                    className="text-red-300 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div className="flex-1">
                    <span className="text-red-200 font-medium">
                      TikTok Download Error:
                    </span>
                    <p className="text-red-200 mt-1">{error}</p>

                    {/* Troubleshooting suggestions */}
                    <div className="mt-3 space-y-2">
                      <p className="text-red-100 text-sm font-medium">
                        💡 Troubleshooting Tips:
                      </p>
                      <ul className="text-red-200 text-sm space-y-1 ml-4">
                        <li>
                          • Make sure the TikTok video is public (not private
                          account)
                        </li>
                        <li>
                          • Check if the video still exists (not deleted by
                          creator)
                        </li>
                        <li>• Try copying the URL again from TikTok</li>
                        <li>
                          • Some age-restricted content may not be downloadable
                        </li>
                        <li>
                          • Ensure the TikTok account and video are publicly
                          accessible
                        </li>
                      </ul>
                    </div>

                    {url && (
                      <button
                        onClick={() => fetchAvailableFormats(url)}
                        className="mt-3 text-red-300 hover:text-red-200 underline text-sm flex items-center space-x-1"
                      >
                        <RefreshCw size={14} />
                        <span>Try analyzing again</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Alternative methods */}
                <GlassCard className="p-4 bg-blue-500/10 border border-blue-400/30">
                  <h4 className="text-blue-200 font-bold mb-2 flex items-center space-x-2">
                    <Info size={16} />
                    <span>Alternative Methods:</span>
                  </h4>
                  <div className="text-blue-200 text-sm space-y-1">
                    <p>
                      • Try using the full TikTok URL instead of a shortened
                      vm.tiktok.com link
                    </p>
                    <p>
                      • Make sure you&apos;re using the direct video URL from
                      TikTok app or website
                    </p>
                    <p>
                      • Check if the TikTok creator&apos;s account is public and
                      accessible
                    </p>
                    <p>
                      • Ensure the video hasn&apos;t been deleted or made
                      private recently
                    </p>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* SEO Content Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Complete TikTok Downloader - Videos Without Watermark
          </h2>
          <p className="text-lg text-blue-200 max-w-4xl mx-auto">
            Our advanced TikTok downloader supports all types of TikTok content
            including regular videos, trending content, music videos, and
            audio-only downloads with professional-grade features, no watermark,
            and guaranteed audio quality.
          </p>
        </div>

        {/* TikTok Content Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <GlassCard className="p-6 text-center border-l-4 border-l-pink-400 hover:scale-105 transition-transform duration-300">
            <Zap className="mx-auto mb-4 text-pink-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">TikTok Videos</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download regular TikTok videos in HD quality without watermark and
              with original audio. Perfect for entertainment, dance videos,
              comedy content, and viral TikTok videos with guaranteed audio
              preservation.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-red-400 hover:scale-105 transition-transform duration-300">
            <Sparkles className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Trending Content
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Save trending TikTok videos and viral content before they
              disappear. Perfect for downloading popular challenges, trending
              sounds, and viral TikTok moments with full quality preservation.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-purple-400 hover:scale-105 transition-transform duration-300">
            <Music className="mx-auto mb-4 text-purple-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">Audio & Music</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Extract high-quality audio and music from TikTok videos. Perfect
              for downloading trending sounds, music clips, audio challenges,
              and original sounds in MP3 format for offline listening.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <GlassCard className="p-8 text-center">
          <Star className="mx-auto mb-4 text-yellow-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            No Watermark Downloads
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Download TikTok videos without watermark in original quality. Choose
            from multiple quality options and formats. Perfect clean downloads
            for any device or use case without TikTok branding.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Activity className="mx-auto mb-4 text-cyan-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Real-Time Progress Tracking
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Watch your TikTok downloads progress in real-time with detailed
            statistics including download speed, estimated time remaining, file
            size, and completion percentage for complete transparency.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Music className="mx-auto mb-4 text-green-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Original Audio Guaranteed
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Every TikTok video download includes the original high-quality audio
            and music. Our advanced processing preserves trending sounds,
            original audio, and music with perfect synchronization.
          </p>
        </GlassCard>
      </div>

      {/* How to Use Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          How to Download TikTok Videos Without Watermark
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Copy TikTok URL
            </h4>
            <p className="text-blue-200">
              Copy the URL of any TikTok video from your browser or the TikTok
              mobile app. Works with all public TikTok content including videos,
              trending content, and profile videos.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Select Quality & Format
            </h4>
            <p className="text-blue-200">
              Paste the TikTok URL above and choose your preferred quality and
              format from the available options. View file size information and
              select video+audio or audio-only format.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              3
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Download & Enjoy
            </h4>
            <p className="text-blue-200">
              Click download and watch real-time progress. Your TikTok content
              will be saved directly to your device without watermark and with
              perfect audio quality.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* FAQ Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions about TikTok Downloads
        </h2>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I download TikTok videos without watermark?
            </h4>
            <p className="text-blue-200">
              Yes! Our TikTok downloader removes the watermark and downloads
              videos in original quality. You get clean TikTok videos without
              any branding or watermarks for personal use.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I download private TikTok videos?
            </h4>
            <p className="text-blue-200">
              No, this tool only works with public TikTok content. Private
              accounts, restricted videos, or age-restricted content cannot be
              downloaded for privacy and security reasons.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              What quality options are available for TikTok downloads?
            </h4>
            <p className="text-blue-200">
              We provide all available quality options from TikTok, typically
              including HD quality and mobile-optimized versions. You can also
              choose audio-only downloads to extract music and sounds from
              TikTok videos.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Is the original audio included in TikTok downloads?
            </h4>
            <p className="text-blue-200">
              Yes! All TikTok video downloads automatically include the original
              high-quality audio, music, and sounds. This includes trending
              sounds, original audio, and background music with perfect
              synchronization.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I extract audio only from TikTok videos?
            </h4>
            <p className="text-blue-200">
              Absolutely! You can extract high-quality audio from any TikTok
              video. Perfect for downloading trending sounds, music clips,
              original audio, and sound effects in MP3 format for offline use.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* TikTok Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <GlassCard className="p-6 text-center border-l-4 border-l-pink-400">
          <CheckCircle className="mx-auto mb-4 text-pink-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            Free TikTok Downloader
          </h3>
          <p className="text-blue-200">
            Completely free TikTok video downloader with no watermark, no
            limits, registration, or hidden fees.
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-l-4 border-l-green-400">
          <Sparkles className="mx-auto mb-4 text-green-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            High Quality Downloads
          </h3>
          <p className="text-blue-200">
            Download TikTok content in original quality without watermark and
            with perfect audio preservation and synchronization.
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-l-4 border-l-red-400">
          <Timer className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Fast & Reliable</h3>
          <p className="text-blue-200">
            Quick TikTok downloads with real-time progress tracking and reliable
            download completion for all video types.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
