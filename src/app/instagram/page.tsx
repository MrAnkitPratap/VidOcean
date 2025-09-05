// "use client";

// import { useState } from "react";
// import { GlassCard } from "../components/ui/glass-card";
// import {
//   Download,
//   Instagram,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   ExternalLink,
//   Copy,
//   Terminal,
//   Globe,
//   Play,
//   Image as ImageIcon,
//   Heart,
//   MessageCircle,
//   Share,
// } from "lucide-react";

// interface DownloadResult {
//   success: boolean;
//   platform: string;
//   title: string;
//   thumbnail?: string;
//   downloadUrl: string;
//   type: string;
//   author?: string;
//   message?: string;
//   external_tools?: ExternalTool[];
//   error?: string;
// }

// interface ExternalTool {
//   name: string;
//   website?: string;
//   command?: string;
//   instruction: string;
// }

// export default function InstagramPage() {
//   const [url, setUrl] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<DownloadResult | null>(null);
//   const [error, setError] = useState("");
//   const [copied, setCopied] = useState(false);

//   const handleDownload = async () => {
//     if (!url.trim()) {
//       setError("Please enter a valid Instagram URL");
//       return;
//     }

//     if (!isInstagramUrl(url.trim())) {
//       setError("Please enter a valid Instagram URL (posts, reels, or stories)");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setResult(null);

//     try {
//       const response = await fetch("/api/download-free", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url: url.trim() }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const data = await response.json();

//       if (data.success) {
//         setResult(data);
//         setError("");
//       } else {
//         setError(data.error || "Instagram download failed. Please try again.");
//       }
//     } catch (err: any) {
//       setError(`Connection failed: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isInstagramUrl = (urlString: string) => {
//     try {
//       const url = new URL(urlString);
//       return url.hostname.includes("instagram.com");
//     } catch {
//       return false;
//     }
//   };

//   const handleCopyUrl = async (urlToCopy: string) => {
//     try {
//       await navigator.clipboard.writeText(urlToCopy);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Failed to copy:", err);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !loading) {
//       handleDownload();
//     }
//   };

//   return (
//     <div className="container mx-auto max-w-4xl px-4">
//       {/* Instagram Hero Section */}
//       <div className="text-center mb-12">
//         <div className="mb-6">
//           <Instagram className="mx-auto mb-4 text-pink-400" size={64} />
//         </div>
//         <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
//           Instagram Downloader
//         </h1>
//         <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
//           Download{" "}
//           <span className="text-pink-400 font-bold">Instagram Reels</span>,
//           <span className="text-purple-400 font-bold"> Posts</span>, and
//           <span className="text-pink-500 font-bold"> Stories</span> in high
//           quality!
//         </p>
//       </div>

//       {/* Instagram Download Card */}
//       <div className="max-w-3xl mx-auto mb-12">
//         <GlassCard
//           variant="strong"
//           className="p-8 border-l-4 border-l-pink-400"
//         >
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
//               <Instagram className="text-white" size={28} />
//             </div>
//             <h2 className="text-3xl font-bold text-white mb-3">
//               Paste Instagram URL
//             </h2>
//             <p className="text-blue-100 text-lg">
//               Supports posts, reels, IGTV, and stories
//             </p>
//           </div>

//           <div className="space-y-6">
//             <div className="relative">
//               <input
//                 type="url"
//                 placeholder="https://www.instagram.com/p/... or https://www.instagram.com/reel/..."
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="w-full px-6 py-4 rounded-xl bg-black/40 border border-pink-300/20 text-white placeholder-pink-200/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-lg transition-all duration-300"
//                 disabled={loading}
//               />
//               {url && (
//                 <button
//                   onClick={() => setUrl("")}
//                   className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-300/60 hover:text-white"
//                 >
//                   <XCircle size={20} />
//                 </button>
//               )}
//             </div>

//             <button
//               onClick={handleDownload}
//               disabled={loading || !url.trim()}
//               className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xl rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin" size={24} />
//                   <span>Processing Instagram Content...</span>
//                 </>
//               ) : (
//                 <>
//                   <Download size={24} />
//                   <span>Download Instagram Content</span>
//                 </>
//               )}
//             </button>

//             {/* Error Display */}
//             {error && (
//               <div className="flex items-center space-x-3 p-4 bg-red-500/20 border border-red-400/40 rounded-xl">
//                 <XCircle className="text-red-300 flex-shrink-0" size={20} />
//                 <span className="text-red-200">{error}</span>
//               </div>
//             )}

//             {/* Result Display */}
//             {result && (
//               <div className="space-y-6">
//                 <GlassCard className="p-6 border border-pink-400/30">
//                   <div className="flex items-center space-x-3 mb-4">
//                     <CheckCircle className="text-pink-400" size={24} />
//                     <span className="text-pink-200 font-bold text-lg">
//                       Instagram Content Found!
//                     </span>
//                   </div>

//                   <div className="grid md:grid-cols-3 gap-6 items-center">
//                     <div className="flex justify-center">
//                       {result.thumbnail ? (
//                         <img
//                           src={result.thumbnail}
//                           alt="Instagram Content"
//                           className="w-full max-w-sm rounded-xl object-cover border-2 border-pink-400/30 shadow-lg"
//                         />
//                       ) : (
//                         <div className="w-full max-w-sm h-64 bg-pink-900/30 rounded-xl flex items-center justify-center border-2 border-pink-400/30">
//                           <Instagram size={48} className="text-pink-400" />
//                         </div>
//                       )}
//                     </div>

//                     <div className="md:col-span-2 space-y-4">
//                       <div>
//                         <h3 className="text-2xl font-bold text-white mb-3">
//                           {result.title}
//                         </h3>
//                         <div className="flex flex-wrap items-center gap-3 text-pink-200">
//                           <div className="flex items-center space-x-2 bg-pink-500/20 px-3 py-1 rounded-full">
//                             <Instagram size={16} />
//                             <span className="font-medium">Instagram</span>
//                           </div>
//                           <div className="flex items-center space-x-2 bg-pink-500/20 px-3 py-1 rounded-full">
//                             {result.type === "video" ? (
//                               <Play size={16} />
//                             ) : (
//                               <ImageIcon size={16} />
//                             )}
//                             <span className="capitalize">{result.type}</span>
//                           </div>
//                           {result.author && (
//                             <div className="bg-pink-500/20 px-3 py-1 rounded-full">
//                               <span>@{result.author}</span>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex space-x-3">
//                         <button
//                           onClick={() =>
//                             window.open(result.downloadUrl, "_blank")
//                           }
//                           className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
//                         >
//                           <ExternalLink size={20} />
//                           <span>Open Instagram Post</span>
//                         </button>
//                         <button
//                           onClick={() => handleCopyUrl(result.downloadUrl)}
//                           className={`px-6 py-3 ${
//                             copied
//                               ? "bg-cyan-500"
//                               : "bg-gray-700 hover:bg-gray-600"
//                           } text-white font-bold rounded-xl transition-all duration-300 shadow-lg`}
//                         >
//                           {copied ? (
//                             <CheckCircle size={20} />
//                           ) : (
//                             <Copy size={20} />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </GlassCard>

//                 {/* Instagram Tools */}
//                 {result.external_tools && (
//                   <GlassCard className="p-6">
//                     <h4 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
//                       <span>📱 Instagram Download Tools</span>
//                     </h4>
//                     <div className="grid md:grid-cols-2 gap-4">
//                       {result.external_tools.map((tool, index) => (
//                         <div
//                           key={index}
//                           className="bg-pink-900/30 rounded-xl p-4 hover:bg-pink-800/40 transition-all duration-300 border border-pink-400/20"
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <span className="text-white font-bold flex items-center space-x-2">
//                               {tool.command ? (
//                                 <Terminal size={16} className="text-pink-400" />
//                               ) : (
//                                 <Globe size={16} className="text-pink-400" />
//                               )}
//                               <span>{tool.name}</span>
//                             </span>
//                             {tool.website && (
//                               <a
//                                 href={tool.website}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="text-pink-400 hover:text-pink-300 font-medium flex items-center space-x-1 hover:underline"
//                               >
//                                 <span>Visit</span>
//                                 <ExternalLink size={14} />
//                               </a>
//                             )}
//                           </div>
//                           <p className="text-pink-200 text-sm mb-3">
//                             {tool.instruction}
//                           </p>
//                           {tool.command && (
//                             <div className="bg-black/40 rounded-lg p-3">
//                               <code className="text-pink-300 text-sm break-all">
//                                 {tool.command}
//                               </code>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </GlassCard>
//                 )}
//               </div>
//             )}
//           </div>
//         </GlassCard>
//       </div>

//       {/* Instagram Features */}
//       <div className="grid md:grid-cols-3 gap-6">
//         <GlassCard className="p-6 text-center border-l-4 border-l-pink-400">
//           <Heart className="mx-auto mb-4 text-pink-400" size={48} />
//           <h3 className="text-xl font-bold text-white mb-2">Instagram Reels</h3>
//           <p className="text-blue-200">Download trending reels in HD quality</p>
//         </GlassCard>

//         <GlassCard className="p-6 text-center border-l-4 border-l-purple-400">
//           <MessageCircle className="mx-auto mb-4 text-purple-400" size={48} />
//           <h3 className="text-xl font-bold text-white mb-2">Instagram Posts</h3>
//           <p className="text-blue-200">Save photos and carousel posts</p>
//         </GlassCard>

//         <GlassCard className="p-6 text-center border-l-4 border-l-pink-500">
//           <Share className="mx-auto mb-4 text-pink-500" size={48} />
//           <h3 className="text-xl font-bold text-white mb-2">
//             Instagram Stories
//           </h3>
//           <p className="text-blue-200">Download stories before they expire</p>
//         </GlassCard>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Download,
  Instagram,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Play,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share,
  Video,
  Music,
  Camera,
  Users,
  Star,
  Sparkles,
  Activity,
  Timer,
  HardDrive,
  Wifi,
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
}

export default function InstagramPage() {
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

  const detectInstagramType = (url: string): string => {
    if (!url) return "unknown";
    const cleanUrl = url.toLowerCase();

    if (cleanUrl.includes("/reel/")) return "reel";
    if (cleanUrl.includes("/p/")) return "post";
    if (cleanUrl.includes("/stories/")) return "story";
    if (cleanUrl.includes("/tv/")) return "igtv";

    return "post"; // default
  };

  const isInstagramUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.hostname.includes("instagram.com");
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (url && isInstagramUrl(url)) {
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

        const contentType = detectInstagramType(videoUrl);

        setLinkDetails({
          title: data.title || "Instagram Content",
          author: data.uploader || "Instagram User",
          duration: data.duration,
          viewCount: data.view_count,
          platform: "instagram",
          type: contentType,
          thumbnail:
            data.thumbnail ||
            "https://via.placeholder.com/300x300?text=Instagram",
        });

        // Auto-select best format
        const formatsToUse =
          data.recommended?.length > 0 ? data.recommended : data.formats;
        if (formatsToUse?.length > 0) {
          setSelectedFormat(formatsToUse[0].format_id);
        }
      } else {
        setError(data.error || "Could not analyze Instagram content");
        setAvailableFormats(null);
      }
    } catch (err: any) {
      setError("Failed to analyze Instagram content. Please check the URL.");
      setAvailableFormats(null);
    } finally {
      setFetchingFormats(false);
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a valid Instagram URL");
      return;
    }

    if (!isInstagramUrl(url.trim())) {
      setError(
        "Please enter a valid Instagram URL (posts, reels, stories, or IGTV)"
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
          platform: "instagram",
          formatId: selectedFormat || "best",
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
        return <Play className="text-pink-400" size={16} />;
      case "story":
        return <Camera className="text-purple-400" size={16} />;
      case "igtv":
        return <Video className="text-blue-400" size={16} />;
      default:
        return <ImageIcon className="text-green-400" size={16} />;
    }
  };

  const ProgressBar = ({ percentage }: { percentage: number }) => (
    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-pink-300/20">
      <div
        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 ease-out"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4">
      {/* SEO-Optimized Hero Section */}
      <div className="text-center mb-16">
        <div className="mb-6">
          <Instagram
            className="mx-auto mb-4 text-pink-400 animate-pulse"
            size={64}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
          Instagram Video Downloader
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
          Download{" "}
          <span className="text-pink-400 font-bold">Instagram Reels</span>,
          <span className="text-purple-400 font-bold"> Posts</span>,
          <span className="text-pink-500 font-bold"> Stories</span>, and
          <span className="text-blue-400 font-bold"> IGTV</span> videos in high
          quality with guaranteed audio!
        </p>

        {/* SEO Benefits */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-pink-500/20 px-4 py-2 rounded-full text-pink-300 flex items-center space-x-2">
            <Heart size={16} />
            <span>Reels & Posts</span>
          </span>
          <span className="bg-purple-500/20 px-4 py-2 rounded-full text-purple-300 flex items-center space-x-2">
            <Camera size={16} />
            <span>Stories & IGTV</span>
          </span>
          <span className="bg-blue-500/20 px-4 py-2 rounded-full text-blue-300 flex items-center space-x-2">
            <Music size={16} />
            <span>Audio Included</span>
          </span>
          <span className="bg-green-500/20 px-4 py-2 rounded-full text-green-300 flex items-center space-x-2">
            <Sparkles size={16} />
            <span>100% Free</span>
          </span>
        </div>
      </div>

      {/* Instagram Download Interface */}
      <div className="max-w-4xl mx-auto mb-16">
        <GlassCard
          variant="strong"
          className="p-8 border-l-4 border-l-pink-400"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4">
              <Instagram className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Professional Instagram Downloader
            </h2>
            <p className="text-blue-100 text-lg">
              Advanced format selection • Real-time progress • Supports all
              Instagram content types
            </p>
          </div>

          <div className="space-y-6">
            {/* URL Input */}
            <div className="relative">
              <input
                type="url"
                placeholder="Paste Instagram URL: Reels, Posts, Stories, IGTV (e.g., instagram.com/p/... or instagram.com/reel/...)"
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
                  <img
                    src={linkDetails.thumbnail}
                    alt={linkDetails.title}
                    className="w-24 h-24 rounded-xl object-cover border border-pink-300/30 flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/96x96?text=📸";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg mb-2">
                      {linkDetails.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-pink-200">
                      <div className="flex items-center space-x-1">
                        <Instagram size={16} className="text-pink-400" />
                        <span>Instagram</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getContentIcon(linkDetails.type)}
                        <span className="capitalize">{linkDetails.type}</span>
                      </div>
                      {linkDetails.author && (
                        <div className="flex items-center space-x-1">
                          <Users size={16} />
                          <span>@{linkDetails.author}</span>
                        </div>
                      )}
                      {linkDetails.duration && (
                        <div className="flex items-center space-x-1">
                          <Timer size={16} />
                          <span>{linkDetails.duration}</span>
                        </div>
                      )}
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

                  <div className="space-y-3 max-h-64 overflow-y-auto">
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
                              <Music size={14} className="text-green-400" />
                            ) : format.type === "video" ? (
                              <Video size={14} className="text-blue-400" />
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
                    Analyzing Instagram content and getting available formats...
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
                      Download Progress
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
                        Instagram content downloaded successfully!
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
              className="w-full py-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xl rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Processing Instagram Content...</span>
                </>
              ) : (
                <>
                  <Download size={28} />
                  <span>Download Instagram Content</span>
                  <Sparkles size={24} />
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
                  <span className="text-red-200">{error}</span>
                  {url && (
                    <button
                      onClick={() => fetchAvailableFormats(url)}
                      className="mt-2 text-red-300 hover:text-red-200 underline text-sm block"
                    >
                      Try analyzing again
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* SEO Content Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Complete Instagram Content Downloader
          </h2>
          <p className="text-lg text-blue-200 max-w-4xl mx-auto">
            Our advanced Instagram downloader supports all types of Instagram
            content with professional-grade features and guaranteed audio
            quality for videos.
          </p>
        </div>

        {/* Instagram Content Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <GlassCard className="p-6 text-center border-l-4 border-l-pink-400 hover:scale-105 transition-transform duration-300">
            <Heart className="mx-auto mb-4 text-pink-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Instagram Reels
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download trending Instagram Reels in HD quality with original
              audio. Perfect for saving entertaining short videos and viral
              content.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-purple-400 hover:scale-105 transition-transform duration-300">
            <ImageIcon className="mx-auto mb-4 text-purple-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Instagram Posts
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Save Instagram photos, carousel posts, and video posts. Supports
              single images, multiple photos, and video content from any public
              post.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-blue-400 hover:scale-105 transition-transform duration-300">
            <Camera className="mx-auto mb-4 text-blue-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Instagram Stories
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download Instagram Stories before they expire. Save memorable
              moments, behind-the-scenes content, and temporary posts
              permanently.
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center border-l-4 border-l-green-400 hover:scale-105 transition-transform duration-300">
            <Video className="mx-auto mb-4 text-green-400" size={48} />
            <h3 className="text-xl font-bold text-white mb-3">
              Instagram IGTV
            </h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Download long-form Instagram IGTV videos in full quality. Perfect
              for tutorials, interviews, and extended content with guaranteed
              audio.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <GlassCard className="p-8 text-center">
          <Star className="mx-auto mb-4 text-yellow-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Professional Quality
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Download Instagram content in the highest available quality with
            multiple format options. Choose from different resolutions and file
            sizes to suit your needs.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Activity className="mx-auto mb-4 text-cyan-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Real-Time Progress
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Watch your Instagram downloads progress in real-time with detailed
            statistics including speed, ETA, and completion percentage for
            complete transparency.
          </p>
        </GlassCard>

        <GlassCard className="p-8 text-center">
          <Music className="mx-auto mb-4 text-green-400" size={56} />
          <h3 className="text-2xl font-bold text-white mb-4">
            Audio Guaranteed
          </h3>
          <p className="text-blue-200 leading-relaxed">
            Every Instagram video download includes high-quality audio. Our
            advanced processing ensures perfect synchronization between video
            and audio tracks.
          </p>
        </GlassCard>
      </div>

      {/* How to Use Section */}
      <GlassCard className="p-8 mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          How to Download Instagram Content
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              1
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Copy Instagram URL
            </h4>
            <p className="text-blue-200">
              Copy the URL of any Instagram Reel, Post, Story, or IGTV video
              from your browser or the Instagram app.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              2
            </div>
            <h4 className="text-xl font-bold text-white mb-3">
              Paste & Select Quality
            </h4>
            <p className="text-blue-200">
              Paste the URL above and choose your preferred quality and format
              from the available options with file size information.
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
              Click download and watch real-time progress. Your Instagram
              content will be saved directly to your device with perfect
              quality.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* FAQ Section */}
      <GlassCard className="p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Can I download private Instagram content?
            </h4>
            <p className="text-blue-200">
              No, this tool only works with public Instagram content. Private
              accounts and restricted content cannot be downloaded for privacy
              and security reasons.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              What quality options are available?
            </h4>
            <p className="text-blue-200">
              We provide all available quality options from Instagram, typically
              including HD (1080p), standard (720p), and mobile-optimized
              versions with different file sizes.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-2">
              Is the audio included in video downloads?
            </h4>
            <p className="text-blue-200">
              Yes! All video downloads automatically include high-quality audio.
              Our advanced processing ensures perfect audio-video
              synchronization for the best viewing experience.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
