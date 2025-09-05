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
  const eventSourceRef = useRef<EventSource | null>(null);

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
    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-red-300/20">
      <div
        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
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
    <div className="container mx-auto max-w-6xl px-4">
      {/* SEO-Optimized Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-6">
          <Youtube
            className="mx-auto mb-4 text-red-400 animate-pulse"
            size={64}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
          YouTube Video & Shorts Downloader
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
          Download{" "}
          <span className="text-red-400 font-bold">YouTube Videos</span>,
          <span className="text-pink-400 font-bold"> YouTube Shorts</span>, and
          <span className="text-blue-400 font-bold"> Audio</span> in high
          quality with guaranteed audio! Free YouTube downloader supporting all
          video types with real-time progress tracking and multiple quality
          options.
        </p>

        {/* SEO Benefits */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-red-500/20 px-4 py-2 rounded-full text-red-300 flex items-center space-x-2">
            <Video size={16} />
            <span>YouTube Videos</span>
          </span>
          <span className="bg-pink-500/20 px-4 py-2 rounded-full text-pink-300 flex items-center space-x-2">
            <Smartphone size={16} />
            <span>YouTube Shorts</span>
          </span>
          <span className="bg-blue-500/20 px-4 py-2 rounded-full text-blue-300 flex items-center space-x-2">
            <Music size={16} />
            <span>Audio Only</span>
          </span>
          <span className="bg-green-500/20 px-4 py-2 rounded-full text-green-300 flex items-center space-x-2">
            <Sparkles size={16} />
            <span>100% Free</span>
          </span>
        </div>
      </div>

      {/* YouTube Download Interface */}
      <div className="max-w-4xl mx-auto mb-16">
        <GlassCard variant="strong" className="p-8 border-l-4 border-l-red-400">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4">
              <Youtube className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Professional YouTube Downloader
            </h2>
            <p className="text-blue-100 text-lg">
              Advanced format selection • Real-time progress • Supports YouTube
              videos, shorts, and audio downloads
            </p>
          </div>

          <div className="space-y-6">
            {/* URL Input */}
            <div className="relative">
              <input
                type="url"
                placeholder="Paste YouTube URL: Videos, Shorts, or Playlists (e.g., youtube.com/watch?v=... or youtube.com/shorts/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-black/40 border border-red-300/20 text-white placeholder-red-200/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg transition-all duration-300"
                disabled={loading}
              />
              {fetchingFormats && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin text-red-400" size={20} />
                </div>
              )}
              {url && (
                <button
                  onClick={() => setUrl("")}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-300/60 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>

            {/* Content Preview */}
            {linkDetails && (
              <GlassCard className="p-6 border border-red-400/30">
                <div className="flex items-start space-x-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={linkDetails.thumbnail}
                      alt={linkDetails.title}
                      className="w-32 h-24 rounded-xl object-cover border border-red-300/30"
                      onError={(e) => {
                        (
                          e.target as HTMLImageElement
                        ).src = `https://img.youtube.com/vi/${extractVideoId(
                          url
                        )}/hqdefault.jpg`;
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
                    <div className="flex flex-wrap items-center gap-3 text-sm text-red-200">
                      <div className="flex items-center space-x-1">
                        <Youtube size={16} className="text-red-400" />
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
                          <User size={16} />
                          <span className="truncate max-w-32">
                            {linkDetails.author}
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
                <div className="mt-4 pt-4 border-t border-red-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-red-300 font-medium">
                        Content Type:
                      </span>
                      <div className="flex items-center space-x-2">
                        {getContentIcon(linkDetails.type)}
                        <span className="text-white capitalize">
                          {linkDetails.type === "short"
                            ? "YouTube Short (Vertical Video)"
                            : "YouTube Video"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-200">
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
              <GlassCard className="p-6 border border-red-400/30">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="text-red-400" size={20} />
                  <h3 className="text-red-200 font-bold text-lg">
                    Choose Quality & Format
                  </h3>
                  <span className="text-xs bg-red-500/20 px-3 py-1 rounded-full text-red-300">
                    {formatsToDisplay.length} options available
                  </span>
                  <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full text-blue-300">
                    ▶️ All YouTube Formats
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {formatsToDisplay.map((format, index) => (
                    <label
                      key={`${format.format_id}-${index}`}
                      className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 cursor-pointer border border-red-300/20 transition-all"
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.format_id}
                        checked={selectedFormat === format.format_id}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="text-red-400 focus:ring-red-500 w-4 h-4"
                      />

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {format.type === "audio" ? (
                            <Headphones size={14} className="text-green-400" />
                          ) : format.type === "video" ? (
                            <Monitor size={14} className="text-blue-400" />
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
                        <div className="text-red-200 text-sm">
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
              <GlassCard className="p-6 border border-red-400/30">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="animate-spin text-red-400" size={24} />
                  <span className="text-red-200 text-lg">
                    Analyzing YouTube content and getting available formats...
                  </span>
                </div>
              </GlassCard>
            )}

            {/* Progress Display */}
            {downloadProgress && (
              <GlassCard className="p-6 border border-red-400/30">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="text-red-400" size={24} />
                    <h3 className="text-red-200 font-bold text-lg">
                      YouTube Download Progress
                    </h3>
                    <span className="text-xs bg-red-500/20 px-3 py-1 rounded-full text-red-300 capitalize">
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

                    <div className="flex justify-between items-center text-sm text-red-200">
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
                    <div className="bg-red-500/20 rounded-lg p-4">
                      <p className="text-red-200">{downloadProgress.message}</p>
                    </div>
                  )}

                  {downloadProgress.status === "completed" && (
                    <div className="flex items-center space-x-2 text-green-300">
                      <CheckCircle size={20} />
                      <span className="font-medium">
                        YouTube content downloaded successfully!
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
              className="w-full py-5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xl rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Processing YouTube Content...</span>
                </>
              ) : (
                <>
                  <Download size={28} />
                  <span>Download YouTube Content</span>
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
                      YouTube Download Error:
                    </span>
                    <p className="text-red-200 mt-1">{error}</p>

                    {/* Troubleshooting suggestions */}
                    <div className="mt-3 space-y-2">
                      <p className="text-red-100 text-sm font-medium">
                        💡 Troubleshooting Tips:
                      </p>
                      <ul className="text-red-200 text-sm space-y-1 ml-4">
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

      {/* SEO Content Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Complete YouTube Downloader - Videos, Shorts & Audio
          </h2>
          <p className="text-lg text-blue-200 max-w-4xl mx-auto">
            Our advanced YouTube downloader supports all types of YouTube
            content including regular videos, YouTube Shorts, playlists, and
            audio-only downloads with professional-grade features and guaranteed
            audio quality for all video content.
          </p>
        </div>

        {/* YouTube Content Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <GlassCard className="p-6 text-center border-l-4 border-l-red-400 hover:scale-105 transition-transform duration-300">
            <Video className="mx-auto mb-4 text-red-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              YouTube Videos
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download regular YouTube videos in HD quality with original audio.
              Perfect for tutorials, entertainment, educational content, and
              long-form videos with guaranteed audio synchronization and
              multiple quality options.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-pink-400 hover:scale-105 transition-transform duration-300">
            <Smartphone className="mx-auto mb-4 text-pink-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              YouTube Shorts
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Save YouTube Shorts in their original vertical format. Perfect for
              downloading trending short-form content, viral videos, and
              mobile-optimized content with full audio and video quality
              preservation.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-green-400 hover:scale-105 transition-transform duration-300">
            <Headphones className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Audio Only Downloads
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Extract high-quality audio from any YouTube video or short.
              Perfect for music, podcasts, interviews, and educational content
              when you only need the audio track in MP3 or M4A format.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <GlassCard className="p-8 text-center">
          <Star className="mx-auto mb-4 text-yellow-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Multiple Quality Options
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Download YouTube content in your preferred quality from 360p to 4K
            resolution. Choose from video+audio, video-only, or audio-only
            formats. Perfect quality selection for any device or use case.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Activity className="mx-auto mb-4 text-cyan-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Real-Time Progress Tracking
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Watch your YouTube downloads progress in real-time with detailed
            statistics including download speed, estimated time remaining, file
            size, and completion percentage for complete transparency.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Music className="mx-auto mb-4 text-green-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Audio Quality Guaranteed
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Every YouTube video download includes high-quality audio
            automatically merged with video. Our advanced processing ensures
            perfect audio-video synchronization for the best viewing experience.
          </p>
        </GlassCard>
      </div>

      {/* How to Use Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          How to Download YouTube Videos & Shorts
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Copy YouTube URL
            </h4>
            <p className="text-blue-200">
              Copy the URL of any YouTube video or YouTube Short from your
              browser or the YouTube mobile app. Works with all public YouTube
              content including regular videos and shorts.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Select Quality & Format
            </h4>
            <p className="text-blue-200">
              Paste the YouTube URL above and choose your preferred quality and
              format from the available options. View file size information and
              select video+audio, video-only, or audio-only format.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              3
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Download & Enjoy
            </h4>
            <p className="text-blue-200">
              Click download and watch real-time progress. Your YouTube content
              will be saved directly to your device with perfect quality and
              guaranteed audio synchronization.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* FAQ Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions about YouTube Downloads
        </h2>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I download private or unlisted YouTube videos?
            </h4>
            <p className="text-blue-200">
              No, this tool only works with public YouTube content. Private,
              unlisted, or age-restricted videos cannot be downloaded for
              privacy and security reasons. The YouTube video must be publicly
              accessible for downloads to work.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              What's the difference between YouTube videos and YouTube Shorts?
            </h4>
            <p className="text-blue-200">
              YouTube Shorts are vertical videos up to 60 seconds long,
              optimized for mobile viewing. Regular YouTube videos are
              horizontal and can be any length. Our downloader supports both
              formats and preserves their original aspect ratios.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              What quality options are available for YouTube downloads?
            </h4>
            <p className="text-blue-200">
              We provide all available quality options from YouTube, including
              4K (2160p), Full HD (1080p), HD (720p), SD (480p), and mobile
              (360p). You can also choose audio-only downloads in high-quality
              MP3 or M4A format.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Is the audio included in YouTube video downloads?
            </h4>
            <p className="text-blue-200">
              Yes! All YouTube video downloads automatically include
              high-quality audio. Our advanced processing ensures perfect
              audio-video synchronization for the best viewing experience,
              especially important for music videos and educational content.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I download audio-only from YouTube videos?
            </h4>
            <p className="text-blue-200">
              Absolutely! You can extract high-quality audio from any YouTube
              video or short. Perfect for music, podcasts, interviews, and
              educational content when you only need the audio track. Available
              in MP3 and M4A formats.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Are there any limitations on YouTube downloads?
            </h4>
            <p className="text-blue-200">
              Our YouTube downloader is completely free with no limits on the
              number of downloads. However, we only support public YouTube
              content. Premium, paid, or copyrighted content with restrictions
              cannot be downloaded.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* YouTube Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <GlassCard className="p-6 text-center border-l-4 border-l-red-400">
          <CheckCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            Free YouTube Downloader
          </h3>
          <p className="text-blue-200">
            Completely free YouTube video and shorts downloader with no limits,
            registration, or hidden fees.
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-l-4 border-l-green-400">
          <Sparkles className="mx-auto mb-4 text-green-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            High Quality Downloads
          </h3>
          <p className="text-blue-200">
            Download YouTube content in original quality up to 4K resolution
            with perfect audio synchronization.
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-l-4 border-l-blue-400">
          <Timer className="mx-auto mb-4 text-blue-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Fast & Reliable</h3>
          <p className="text-blue-200">
            Quick YouTube downloads with real-time progress tracking and
            reliable download completion.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
