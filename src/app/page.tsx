"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "./components/ui/glass-card";
import {
  Download,
  Instagram,
  Facebook,
  Youtube,
  Sparkles,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Waves,
  Eye,
  Clock,
  User,
  Info,
  Video,
  Music,
  List,
  RefreshCw,
  VolumeX,
  Activity,
  HardDrive,
  Wifi,
  Timer,
} from "lucide-react";
import OceanBackground from "./components/OceanBackground";

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

export default function HomePage() {
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
  const eventSourceRef = useRef<EventSource | null>(null);

  const detectPlatform = (url: string): string => {
    if (!url) return "unknown";
    const cleanUrl = url.toLowerCase().trim();

    if (cleanUrl.includes("instagram.com")) return "instagram";
    if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be"))
      return "youtube";
    if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.watch"))
      return "facebook";
    if (cleanUrl.includes("tiktok.com")) return "tiktok";
    if (cleanUrl.includes("twitter.com") || cleanUrl.includes("x.com"))
      return "twitter";

    return "universal";
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (url && isValidUrl(url)) {
      const platform = detectPlatform(url);

      // Different delays for different platforms - YouTube gets priority
      const delay =
        platform === "youtube" ? 300 : platform === "facebook" ? 800 : 1200;

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

    // Clear previous states immediately
    setAvailableFormats(null);
    setSelectedFormat("");
    setLinkDetails(null);

    const platform = detectPlatform(videoUrl);

    try {
      const response = await fetch(
        `/api/list-formats?url=${encodeURIComponent(videoUrl)}`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: FormatResponse = await response.json();

      if (data.success) {
        // Force state update with timeout to avoid race conditions
        setTimeout(() => {
          setAvailableFormats(data);

          // Set link details
          setLinkDetails({
            title: data.title,
            author: data.uploader,
            duration: data.duration,
            viewCount: data.view_count,
            platform: platform,
            thumbnail:
              data.thumbnail ||
              `https://via.placeholder.com/300x200?text=${platform}`,
          });

          // Better auto-selection logic
          const allFormats = data.formats || [];
          const recommendedFormats = data.recommended || [];

          let formatToSelect = "";

          if (platform === "youtube") {
            // YouTube: Prefer all formats over recommended
            if (allFormats.length > 0) {
              formatToSelect = allFormats[0].format_id;
            }
          } else {
            // Other platforms: Prefer recommended
            if (recommendedFormats.length > 0) {
              formatToSelect = recommendedFormats[0].format_id;
            } else if (allFormats.length > 0) {
              formatToSelect = allFormats[0].format_id;
            }
          }

          if (formatToSelect) {
            setSelectedFormat(formatToSelect);
          }
        }, 100);
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
        headers: { "Content-Type": "application/json" },
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
      default: Play,
    };
    const IconComponent =
      iconMap[platform as keyof typeof iconMap] || iconMap.default;
    return <IconComponent className="text-cyan-400" size={16} />;
  };

  const getFormatIcon = (format: VideoFormat) => {
    const hasAudio =
      format.acodec && format.acodec !== "none" && format.acodec !== null;

    if (format.type === "audio")
      return <Music size={14} className="text-green-400" />;
    if (format.type === "video")
      return <Video size={14} className="text-blue-400" />;
    if (format.type === "video+audio" || hasAudio)
      return <Play size={14} className="text-purple-400" />;

    return <Download size={14} className="text-gray-400" />;
  };

  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-blue-300/20">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  // YOUTUBE SPECIAL HANDLING: Always show ALL formats for YouTube
  const getFormatsToDisplay = () => {
    if (!availableFormats || !availableFormats.success) {
      return [];
    }

    const platform = detectPlatform(url);
    const allFormats = availableFormats.formats || [];
    const recommendedFormats = availableFormats.recommended || [];

    // YouTube: Always show ALL formats
    if (platform === "youtube") {
      return allFormats;
    }

    // Other platforms: recommended first, then all
    return recommendedFormats.length > 0 ? recommendedFormats : allFormats;
  };

  const formatsToDisplay = getFormatsToDisplay();

  return (
    <>
      <div className="container mx-auto max-w-5xl px-4">
        <OceanBackground />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <Waves
              className="mx-auto mb-3 text-cyan-400 animate-pulse"
              size={40}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            VidOcean
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Universal downloader with format selection • Real-time progress •
            Direct to browser
          </p>
        </div>

        {/* Download Interface */}
        <div className="max-w-4xl mx-auto mb-12">
          <GlassCard variant="strong" className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-3">
                <Download className="text-white" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">VidOcean</h2>
              <p className="text-blue-100">
                Choose format • Track progress • Download with audio
              </p>
            </div>

            <div className="space-y-6">
              {/* URL Input */}
              <div className="relative">
                <input
                  type="url"
                  placeholder="Paste video URL: YouTube, Instagram, TikTok, Facebook, Twitter..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-blue-300/20 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm transition-all duration-300"
                  disabled={loading}
                />
                {fetchingFormats && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="animate-spin text-cyan-400" size={16} />
                  </div>
                )}
              </div>

              {/* Preview */}
              {linkDetails && (
                <GlassCard className="p-4 border border-cyan-400/30">
                  <div className="flex items-start space-x-4">
                    <img
                      src={linkDetails.thumbnail}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-blue-300/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/80x80?text=🌐";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm mb-1">
                        {linkDetails.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-xs text-blue-200">
                        <div className="flex items-center space-x-1">
                          {getPlatformIcon(linkDetails.platform)}
                          <span className="capitalize">
                            {linkDetails.platform}
                          </span>
                        </div>
                        {linkDetails.author && (
                          <span>• {linkDetails.author}</span>
                        )}
                        {linkDetails.duration && (
                          <span>• {linkDetails.duration}</span>
                        )}
                        {linkDetails.viewCount && (
                          <span>• {linkDetails.viewCount} views</span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Formats Display */}
              {formatsToDisplay.length > 0 && (
                <GlassCard className="p-6 border border-blue-400/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <List className="text-blue-400" size={20} />
                    <span className="text-blue-200 font-bold">
                      Available Formats
                    </span>
                    <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-full text-blue-300">
                      {formatsToDisplay.length} found
                    </span>
                    {detectPlatform(url) === "youtube" && (
                      <span className="text-xs bg-red-500/20 px-2 py-1 rounded-full text-red-300">
                        ▶️ YouTube
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {formatsToDisplay.map((format, index) => (
                      <label
                        key={`${format.format_id}-${index}`}
                        className="flex items-center space-x-3 p-4 rounded-lg hover:bg-white/5 cursor-pointer border border-blue-300/20 transition-all"
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
                            {getFormatIcon(format)}
                            <span className="text-white font-medium">
                              {format.quality} {format.ext.toUpperCase()}
                            </span>
                            {format.isRecommended && (
                              <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full text-green-300">
                                ⭐ Best
                              </span>
                            )}
                            <span className="text-xs bg-gray-500/20 px-2 py-1 rounded-full text-gray-300">
                              {format.format_id}
                            </span>
                          </div>

                          <div className="text-blue-200 text-xs">
                            {format.type} •
                            <span className="font-bold text-cyan-300">
                              {" "}
                              {format.filesizeMB > 0
                                ? `${format.filesizeMB}MB`
                                : format.filesize}
                            </span>
                            {format.fps && <span> • {format.fps}fps</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Show loading state while fetching formats */}
              {fetchingFormats && (
                <GlassCard className="p-6 border border-blue-400/30">
                  <div className="flex items-center justify-center space-x-3">
                    <Loader2 className="animate-spin text-cyan-400" size={20} />
                    <span className="text-blue-200">
                      Getting available formats...
                    </span>
                  </div>
                </GlassCard>
              )}

              {/* Progress Display */}
              {downloadProgress && (
                <GlassCard className="p-6 border border-cyan-400/30">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Activity className="text-cyan-400" size={20} />
                      <span className="text-cyan-200 font-bold">
                        Download Progress
                      </span>
                      <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded-full text-cyan-300 capitalize">
                        {downloadProgress.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold text-lg">
                          {downloadProgress.percentage.toFixed(1)}%
                        </span>
                        {downloadProgress.speed && (
                          <div className="flex items-center space-x-2 text-green-300 text-sm">
                            <Wifi size={14} />
                            <span>{downloadProgress.speed}</span>
                          </div>
                        )}
                      </div>

                      <ProgressBar percentage={downloadProgress.percentage} />

                      <div className="flex justify-between items-center text-xs text-blue-200">
                        {downloadProgress.downloaded &&
                          downloadProgress.totalSize && (
                            <div className="flex items-center space-x-2">
                              <HardDrive size={12} />
                              <span>
                                {downloadProgress.downloaded} of{" "}
                                {downloadProgress.totalSize}
                              </span>
                            </div>
                          )}

                        {downloadProgress.eta && (
                          <div className="flex items-center space-x-2 text-yellow-300">
                            <Timer size={12} />
                            <span>ETA {downloadProgress.eta}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {downloadProgress.message && (
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-200 text-sm">
                          {downloadProgress.message}
                        </p>
                      </div>
                    )}

                    {downloadProgress.status === "completed" && (
                      <div className="flex items-center space-x-2 text-green-300">
                        <CheckCircle size={16} />
                        <span className="font-medium">
                          Download completed! File sent to browser.
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
                  !selectedFormat ||
                  formatsToDisplay.length === 0
                }
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Starting Download...</span>
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    <span>
                      {selectedFormat
                        ? `Download ${selectedFormat}`
                        : "Select Format to Download"}
                    </span>
                    <Sparkles size={20} />
                  </>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
                  <XCircle
                    className="text-red-300 flex-shrink-0 mt-1"
                    size={20}
                  />
                  <div className="flex-1">
                    <div className="text-red-200 text-sm">{error}</div>
                    {url && (
                      <button
                        onClick={() => fetchAvailableFormats(url)}
                        className="mt-2 text-red-300 hover:text-red-200 underline text-sm flex items-center space-x-1"
                      >
                        <RefreshCw size={14} />
                        <span>Try getting formats again</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
            <List className="mx-auto mb-2 text-cyan-400" size={24} />
            <h4 className="text-sm font-bold text-white mb-1">
              Instant Format Display
            </h4>
            <p className="text-blue-200 text-xs">See all formats immediately</p>
          </GlassCard>

          <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
            <Activity className="mx-auto mb-2 text-green-400" size={24} />
            <h4 className="text-sm font-bold text-white mb-1">
              Real-Time Progress
            </h4>
            <p className="text-blue-200 text-xs">Live download tracking</p>
          </GlassCard>

          <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
            <Play className="mx-auto mb-2 text-purple-400" size={24} />
            <h4 className="text-sm font-bold text-white mb-1">Audio + Video</h4>
            <p className="text-blue-200 text-xs">No more silent videos</p>
          </GlassCard>

          <GlassCard className="p-4 text-center hover:scale-105 transition-transform duration-300">
            <Download className="mx-auto mb-2 text-yellow-400" size={24} />
            <h4 className="text-sm font-bold text-white mb-1">
              Browser Download
            </h4>
            <p className="text-blue-200 text-xs">Direct to Downloads folder</p>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-200/70">
              <Waves size={16} className="text-cyan-400" />
              <span className="text-sm">
                Instant Format Display • Real-Time Progress • Made with 💙
              </span>
              <Waves size={16} className="text-cyan-400" />
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
