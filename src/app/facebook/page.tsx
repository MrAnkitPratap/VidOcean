"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Download,
  Facebook,
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
  Share2,
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

export default function FacebookPage() {
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

  const detectFacebookType = (url: string): string => {
    if (!url) return "unknown";
    const cleanUrl = url.toLowerCase();

    if (cleanUrl.includes("/reel/") || cleanUrl.includes("/reels/"))
      return "reel";
    if (cleanUrl.includes("/watch/") || cleanUrl.includes("/videos/"))
      return "video";
    if (cleanUrl.includes("/stories/")) return "story";
    if (cleanUrl.includes("/posts/") || cleanUrl.includes("/permalink/"))
      return "post";
    if (cleanUrl.includes("fb.watch/")) return "video";

    return "video"; // default
  };

  const isFacebookUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return (
        url.hostname.includes("facebook.com") ||
        url.hostname.includes("fb.watch")
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (url && isFacebookUrl(url)) {
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

        const contentType = detectFacebookType(videoUrl);

        setLinkDetails({
          title: data.title || "Facebook Content",
          author: data.uploader || "Facebook User",
          duration: data.duration,
          viewCount: data.view_count,
          platform: "facebook",
          type: contentType,
          thumbnail:
            data.thumbnail ||
            "https://via.placeholder.com/300x200?text=Facebook",
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
            "Could not analyze Facebook content. Content may be private, deleted, or restricted."
        );
        setAvailableFormats(null);
      }
    } catch (err: any) {
      setError(
        "Failed to analyze Facebook content. Please check the URL and ensure the content is public."
      );
      setAvailableFormats(null);
    } finally {
      setFetchingFormats(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a valid Facebook URL");
      return;
    }

    if (!isFacebookUrl(url.trim())) {
      setError(
        "Please enter a valid Facebook URL (videos, reels, posts, or stories)"
      );
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
          platform: "facebook",
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
            "Facebook download failed to start. Content may be private or unavailable."
        );
        setLoading(false);
      }
    } catch (err: any) {
      setError(`Facebook download failed: ${err.message}`);
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
          setError(progress.error || "Facebook download failed");
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
      case "reel":
        return <Smartphone className="text-blue-400" size={16} />;
      case "story":
        return <Users className="text-purple-400" size={16} />;
      case "post":
        return <Share2 className="text-green-400" size={16} />;
      default:
        return <Video className="text-blue-600" size={16} />;
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
    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-blue-300/20">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4">
      {/* SEO-Optimized Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-6">
          <Facebook
            className="mx-auto mb-4 text-blue-500 animate-pulse"
            size={64}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
          Facebook Video & Reels Downloader
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
          Download{" "}
          <span className="text-blue-400 font-bold">Facebook Videos</span>,
          <span className="text-purple-400 font-bold"> Facebook Reels</span>,
          <span className="text-green-400 font-bold"> Posts</span>, and
          <span className="text-pink-400 font-bold"> Stories</span> in high
          quality with guaranteed audio! Free Facebook downloader supporting all
          content types with real-time progress tracking and multiple quality
          options.
        </p>

        {/* SEO Benefits */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-blue-500/20 px-4 py-2 rounded-full text-blue-300 flex items-center space-x-2">
            <Video size={16} />
            <span>Facebook Videos</span>
          </span>
          <span className="bg-purple-500/20 px-4 py-2 rounded-full text-purple-300 flex items-center space-x-2">
            <Smartphone size={16} />
            <span>Facebook Reels</span>
          </span>
          <span className="bg-green-500/20 px-4 py-2 rounded-full text-green-300 flex items-center space-x-2">
            <Share2 size={16} />
            <span>Posts & Stories</span>
          </span>
          <span className="bg-pink-500/20 px-4 py-2 rounded-full text-pink-300 flex items-center space-x-2">
            <Sparkles size={16} />
            <span>100% Free</span>
          </span>
        </div>
      </div>

      {/* Facebook Download Interface */}
      <div className="max-w-4xl mx-auto mb-16">
        <GlassCard
          variant="strong"
          className="p-8 border-l-4 border-l-blue-400"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-4">
              <Facebook className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Professional Facebook Downloader
            </h2>
            <p className="text-blue-100 text-lg">
              Advanced format selection • Real-time progress • Supports Facebook
              videos, reels, posts, and stories
            </p>
          </div>

          <div className="space-y-6">
            {/* URL Input */}
            <div className="relative">
              <input
                type="url"
                placeholder="Paste Facebook URL: Videos, Reels, Posts, or Stories (e.g., facebook.com/watch/... or fb.watch/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-6 py-4 rounded-xl bg-black/40 border border-blue-300/20 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-all duration-300"
                disabled={loading}
              />
              {fetchingFormats && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin text-blue-400" size={20} />
                </div>
              )}
              {url && (
                <button
                  onClick={() => setUrl("")}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-300/60 hover:text-white"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>

            {/* Content Preview */}
            {linkDetails && (
              <GlassCard className="p-6 border border-blue-400/30">
                <div className="flex items-start space-x-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={linkDetails.thumbnail}
                      alt={linkDetails.title}
                      className="w-32 h-24 rounded-xl object-cover border border-blue-300/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/128x96?text=📘";
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
                    <div className="flex flex-wrap items-center gap-3 text-sm text-blue-200">
                      <div className="flex items-center space-x-1">
                        <Facebook size={16} className="text-blue-500" />
                        <span>Facebook</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getContentIcon(linkDetails.type)}
                        <span className="capitalize">
                          {linkDetails.type === "reel"
                            ? "Facebook Reel"
                            : linkDetails.type === "story"
                            ? "Facebook Story"
                            : linkDetails.type === "post"
                            ? "Facebook Post"
                            : "Facebook Video"}
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
                <div className="mt-4 pt-4 border-t border-blue-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-300 font-medium">
                        Content Type:
                      </span>
                      <div className="flex items-center space-x-2">
                        {getContentIcon(linkDetails.type)}
                        <span className="text-white capitalize">
                          {linkDetails.type === "reel"
                            ? "Facebook Reel (Short Video)"
                            : linkDetails.type === "story"
                            ? "Facebook Story"
                            : linkDetails.type === "post"
                            ? "Facebook Post"
                            : "Facebook Video"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-200">
                      {linkDetails.type === "reel" && (
                        <span className="bg-purple-500/20 px-2 py-1 rounded-full text-purple-300">
                          📱 Short Format
                        </span>
                      )}
                      {linkDetails.type === "story" && (
                        <span className="bg-pink-500/20 px-2 py-1 rounded-full text-pink-300">
                          ⏰ 24hr Content
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

            {/* Format Selection */}
            {availableFormats?.formats &&
              availableFormats.formats.length > 0 && (
                <GlassCard className="p-6 border border-blue-400/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <Star className="text-blue-400" size={20} />
                    <h3 className="text-blue-200 font-bold text-lg">
                      Choose Quality & Format
                    </h3>
                    <span className="text-xs bg-blue-500/20 px-3 py-1 rounded-full text-blue-300">
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
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 cursor-pointer border border-blue-300/20 transition-all"
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.format_id}
                          checked={selectedFormat === format.format_id}
                          onChange={(e) => setSelectedFormat(e.target.value)}
                          className="text-blue-400 focus:ring-blue-500 w-4 h-4"
                        />

                        <div className="flex-1">
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
                          <div className="text-blue-200 text-sm">
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
              <GlassCard className="p-6 border border-blue-400/30">
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="animate-spin text-blue-400" size={24} />
                  <span className="text-blue-200 text-lg">
                    Analyzing Facebook content and getting available formats...
                  </span>
                </div>
              </GlassCard>
            )}

            {/* Progress Display */}
            {downloadProgress && (
              <GlassCard className="p-6 border border-blue-400/30">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Activity className="text-blue-400" size={24} />
                    <h3 className="text-blue-200 font-bold text-lg">
                      Facebook Download Progress
                    </h3>
                    <span className="text-xs bg-blue-500/20 px-3 py-1 rounded-full text-blue-300 capitalize">
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

                    <div className="flex justify-between items-center text-sm text-blue-200">
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
                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <p className="text-blue-200">
                        {downloadProgress.message}
                      </p>
                    </div>
                  )}

                  {downloadProgress.status === "completed" && (
                    <div className="flex items-center space-x-2 text-green-300">
                      <CheckCircle size={20} />
                      <span className="font-medium">
                        Facebook content downloaded successfully!
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
              className="w-full py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xl rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Processing Facebook Content...</span>
                </>
              ) : (
                <>
                  <Download size={28} />
                  <span>Download Facebook Content</span>
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
                      Facebook Download Error:
                    </span>
                    <p className="text-red-200 mt-1">{error}</p>

                    {/* Troubleshooting suggestions */}
                    <div className="mt-3 space-y-2">
                      <p className="text-red-100 text-sm font-medium">
                        💡 Troubleshooting Tips:
                      </p>
                      <ul className="text-red-200 text-sm space-y-1 ml-4">
                        <li>
                          • Make sure the Facebook content is public (not
                          private or restricted)
                        </li>
                        <li>
                          • Check if the video/post still exists (not deleted by
                          user)
                        </li>
                        <li>• Try copying the URL again from Facebook</li>
                        <li>
                          • Stories expire after 24 hours - download quickly
                        </li>
                        <li>
                          • Some group or page content may require special
                          permissions
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
                      • Try using the full Facebook URL instead of a shortened
                      link
                    </p>
                    <p>• Make sure you're using the direct post/video URL</p>
                    <p>• For group content, ensure the group is public</p>
                    <p>• Check if the content is available in your region</p>
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
            Complete Facebook Downloader - Videos, Reels, Posts & Stories
          </h2>
          <p className="text-lg text-blue-200 max-w-4xl mx-auto">
            Our advanced Facebook downloader supports all types of Facebook
            content including regular videos, Facebook Reels, posts, stories,
            and live videos with professional-grade features and guaranteed
            audio quality for all video content.
          </p>
        </div>

        {/* Facebook Content Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GlassCard className="p-6 text-center border-l-4 border-l-blue-400 hover:scale-105 transition-transform duration-300">
            <Video className="mx-auto mb-4 text-blue-500" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Facebook Videos
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download regular Facebook videos in HD quality with original
              audio. Perfect for entertainment, educational content, news
              videos, and long-form content with guaranteed audio
              synchronization.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-purple-400 hover:scale-105 transition-transform duration-300">
            <Smartphone className="mx-auto mb-4 text-purple-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Facebook Reels
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Save Facebook Reels in their original vertical format. Perfect for
              downloading trending short-form content, viral videos, and
              mobile-optimized content with full audio preservation.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-green-400 hover:scale-105 transition-transform duration-300">
            <Share2 className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Facebook Posts
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download videos from Facebook posts and shared content. Supports
              video posts from pages, profiles, and groups with multiple quality
              options and audio preservation.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-pink-400 hover:scale-105 transition-transform duration-300">
            <Users className="mx-auto mb-4 text-pink-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Facebook Stories
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download Facebook Stories before they expire in 24 hours. Save
              memorable moments, behind-the-scenes content, and temporary posts
              permanently to your device.
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
            Download Facebook content in your preferred quality from SD to HD
            resolution. Choose from video+audio, video-only, or audio-only
            formats. Perfect quality selection for any device.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Activity className="mx-auto mb-4 text-cyan-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Real-Time Progress Tracking
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Watch your Facebook downloads progress in real-time with detailed
            statistics including download speed, estimated time remaining, file
            size, and completion percentage.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Music className="mx-auto mb-4 text-green-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Audio Quality Guaranteed
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Every Facebook video download includes high-quality audio
            automatically merged with video. Our advanced processing ensures
            perfect audio-video synchronization for the best experience.
          </p>
        </GlassCard>
      </div>

      {/* How to Use Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          How to Download Facebook Videos & Reels
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Copy Facebook URL
            </h4>
            <p className="text-blue-200">
              Copy the URL of any Facebook video, reel, post, or story from your
              browser or the Facebook mobile app. Works with all public Facebook
              content.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Select Quality & Format
            </h4>
            <p className="text-blue-200">
              Paste the Facebook URL above and choose your preferred quality and
              format from the available options. View file size information and
              select the best option.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              3
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Download & Save
            </h4>
            <p className="text-blue-200">
              Click download and watch real-time progress. Your Facebook content
              will be saved directly to your device with perfect quality and
              audio synchronization.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* FAQ Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions about Facebook Downloads
        </h2>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I download private Facebook content?
            </h4>
            <p className="text-blue-200">
              No, this tool only works with public Facebook content. Private
              profiles, restricted posts, or group content with privacy settings
              cannot be downloaded for privacy and security reasons.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              What Facebook content types are supported?
            </h4>
            <p className="text-blue-200">
              We support all major Facebook content types including regular
              videos, Facebook Reels, video posts, stories, and live videos.
              Both single videos and shared content from pages and profiles are
              supported.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              How long do Facebook Stories stay available for download?
            </h4>
            <p className="text-blue-200">
              Facebook Stories are only available for 24 hours after posting.
              After that, they disappear unless saved to highlights. Download
              Facebook Stories quickly before they expire to save them
              permanently.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              What quality options are available for Facebook downloads?
            </h4>
            <p className="text-blue-200">
              We provide all available quality options from Facebook, typically
              including HD (720p), SD (480p), and mobile-optimized versions. You
              can also choose audio-only downloads for music content.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Is the audio included in Facebook video downloads?
            </h4>
            <p className="text-blue-200">
              Yes! All Facebook video downloads automatically include
              high-quality audio. Our advanced processing ensures perfect
              audio-video synchronization for the best viewing experience.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Facebook Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <GlassCard className="p-6 text-center border-l-4 border-l-blue-400">
          <CheckCircle className="mx-auto mb-4 text-blue-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            Free Facebook Downloader
          </h3>
          <p className="text-blue-200">
            Completely free Facebook video and reels downloader with no limits,
            registration, or hidden fees.
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-l-4 border-l-green-400">
          <Sparkles className="mx-auto mb-4 text-green-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">
            High Quality Downloads
          </h3>
          <p className="text-blue-200">
            Download Facebook content in original quality with perfect audio
            synchronization and multiple format options.
          </p>
        </GlassCard>

        <GlassCard className="p-6 text-center border-l-4 border-l-purple-400">
          <Timer className="mx-auto mb-4 text-purple-400" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Fast & Reliable</h3>
          <p className="text-blue-200">
            Quick Facebook downloads with real-time progress tracking and
            reliable download completion for all content types.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
