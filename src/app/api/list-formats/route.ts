// import { NextRequest, NextResponse } from "next/server";
// import { exec } from "child_process";
// import { promisify } from "util";

// const execAsync = promisify(exec);

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const url = searchParams.get("url");

//     if (!url) {
//       return NextResponse.json({ error: "URL is required" }, { status: 400 });
//     }

//     console.log("🎥 Fetching formats for:", url);

//     // 🔧 FIXED: Enhanced command with anti-bot measures
//     const command = `yt-dlp -j --no-warnings --no-playlist --ignore-errors --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" --extractor-retries 3 --socket-timeout 30 "${url}"`;

//     try {
//       const { stdout, stderr } = await execAsync(command, {
//         timeout: 45000, // 45 seconds timeout
//         maxBuffer: 1024 * 1024 * 50, // 50MB buffer
//       });

//       // 🔧 Log stderr for debugging
//       if (stderr) {
//         console.log("⚠️ yt-dlp stderr:", stderr);

//         // Check for common YouTube errors
//         if (stderr.includes("Sign in to confirm")) {
//           return NextResponse.json(
//             {
//               success: false,
//               error:
//                 "Video requires authentication. YouTube is detecting automated requests.",
//             },
//             { status: 429 }
//           );
//         }

//         if (
//           stderr.includes("Video unavailable") ||
//           stderr.includes("Private video")
//         ) {
//           return NextResponse.json(
//             {
//               success: false,
//               error: "Video is private or unavailable.",
//             },
//             { status: 404 }
//           );
//         }

//         if (
//           stderr.includes("Failed to extract") ||
//           stderr.includes("Unable to extract")
//         ) {
//           return NextResponse.json(
//             {
//               success: false,
//               error:
//                 "Unable to extract video information. Video may be restricted.",
//             },
//             { status: 500 }
//           );
//         }
//       }

//       if (!stdout || stdout.trim() === "") {
//         return NextResponse.json(
//           {
//             success: false,
//             error:
//               "No video data received. Video may be unavailable or restricted.",
//           },
//           { status: 500 }
//         );
//       }

//       // 🔧 Parse JSON with error handling
//       let videoInfo;
//       try {
//         videoInfo = JSON.parse(stdout.trim());
//       } catch (parseError) {
//         console.error("❌ JSON parse error:", parseError);
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Invalid response from video source.",
//           },
//           { status: 500 }
//         );
//       }

//       if (!videoInfo.formats || !Array.isArray(videoInfo.formats)) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "No video formats available for this content.",
//           },
//           { status: 500 }
//         );
//       }

//       console.log(
//         `✅ Found ${videoInfo.formats.length} formats for: ${
//           videoInfo.title || "Unknown"
//         }`
//       );

//       const processedFormats = processFormats(videoInfo.formats);

//       return NextResponse.json({
//         success: true,
//         title: videoInfo.title || "Unknown Title",
//         duration: formatDuration(videoInfo.duration),
//         thumbnail: videoInfo.thumbnail,
//         uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
//         view_count: formatNumber(videoInfo.view_count),
//         formats: processedFormats.all,
//         recommended: processedFormats.recommended,
//         videoOnly: processedFormats.videoOnly,
//         audioOnly: processedFormats.audioOnly,
//         combined: processedFormats.combined,
//       });
//     } catch (execError: any) {
//       console.error("💥 yt-dlp execution error:", execError);

//       let errorMessage = "Failed to get video information";

//       if (execError.code === "ENOENT") {
//         errorMessage = "yt-dlp not found. Please install yt-dlp on the server.";
//       } else if (execError.signal === "SIGTERM") {
//         errorMessage = "Request timeout. Video processing took too long.";
//       } else if (execError.message.includes("timeout")) {
//         errorMessage = "Request timeout. Please try again.";
//       } else if (execError.stderr?.includes("Sign in to confirm")) {
//         errorMessage = "YouTube anti-bot protection detected. Try again later.";
//       }

//       return NextResponse.json(
//         {
//           success: false,
//           error: errorMessage,
//         },
//         { status: 500 }
//       );
//     }
//   } catch (error: any) {
//     console.error("💀 Format listing error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Server error while processing request",
//       },
//       { status: 500 }
//     );
//   }
// }

// function processFormats(formats: any[]) {
//   const all: any[] = [];
//   const recommended: any[] = [];
//   const videoOnly: any[] = [];
//   const audioOnly: any[] = [];
//   const combined: any[] = [];

//   formats.forEach((format) => {
//     if (!format.format_id) return;

//     const processedFormat = {
//       format_id: format.format_id,
//       ext: format.ext || "unknown",
//       quality: getQualityLabel(format),
//       resolution: getResolution(format),
//       filesize: getFileSize(format.filesize),
//       filesizeMB: getFileSizeMB(format.filesize),
//       fps: format.fps || null,
//       vcodec: format.vcodec,
//       acodec: format.acodec,
//       tbr: format.tbr,
//       type: getFormatType(format),
//       note: format.format_note || "",
//       isRecommended: isRecommendedFormat(format),
//     };

//     all.push(processedFormat);

//     if (processedFormat.type === "video+audio") {
//       combined.push(processedFormat);
//       if (processedFormat.isRecommended) {
//         recommended.push(processedFormat);
//       }
//     } else if (processedFormat.type === "video") {
//       videoOnly.push(processedFormat);
//     } else if (processedFormat.type === "audio") {
//       audioOnly.push(processedFormat);
//     }
//   });

//   const sortByQuality = (a: any, b: any) => {
//     const aHeight = parseInt(a.resolution) || 0;
//     const bHeight = parseInt(b.resolution) || 0;
//     return bHeight - aHeight;
//   };

//   return {
//     all: all.sort(sortByQuality),
//     recommended: recommended.sort(sortByQuality).slice(0, 10),
//     videoOnly: videoOnly.sort(sortByQuality),
//     audioOnly: audioOnly,
//     combined: combined.sort(sortByQuality),
//   };
// }

// function getQualityLabel(format: any): string {
//   if (format.height) {
//     return `${format.height}p`;
//   } else if (format.format_note) {
//     return format.format_note;
//   } else if (format.abr) {
//     return `${format.abr}kbps`;
//   }
//   return "unknown";
// }

// function getResolution(format: any): string {
//   if (format.height && format.width) {
//     return `${format.width}x${format.height}`;
//   } else if (format.height) {
//     return `${format.height}p`;
//   }
//   return "audio";
// }

// function getFileSize(size: number | null): string {
//   if (!size) return "unknown";

//   const bytes = size;
//   const kb = bytes / 1024;
//   const mb = bytes / (1024 * 1024);
//   const gb = bytes / (1024 * 1024 * 1024);

//   if (gb >= 1) {
//     return `${gb.toFixed(1)}GB`;
//   } else if (mb >= 1) {
//     return `${mb.toFixed(1)}MB`;
//   } else if (kb >= 1) {
//     return `${kb.toFixed(1)}KB`;
//   } else {
//     return `${bytes}B`;
//   }
// }

// function getFileSizeMB(size: number | null): number {
//   if (!size) return 0;
//   return Math.round((size / (1024 * 1024)) * 10) / 10;
// }

// function getFormatType(format: any): string {
//   const hasVideo = format.vcodec && format.vcodec !== "none";
//   const hasAudio = format.acodec && format.acodec !== "none";

//   if (hasVideo && hasAudio) {
//     return "video+audio";
//   } else if (hasVideo) {
//     return "video";
//   } else if (hasAudio) {
//     return "audio";
//   }
//   return "unknown";
// }

// function isRecommendedFormat(format: any): boolean {
//   const hasVideo = format.vcodec && format.vcodec !== "none";
//   const hasAudio = format.acodec && format.acodec !== "none";

//   // Prioritize MP4 with both video and audio
//   if (hasVideo && hasAudio && format.ext === "mp4") {
//     return true;
//   }

//   // Common resolutions with audio
//   if (
//     format.height &&
//     [720, 1080, 480, 360].includes(format.height) &&
//     hasAudio
//   ) {
//     return true;
//   }

//   // Good audio formats
//   if (format.acodec && !format.vcodec && ["m4a", "mp3"].includes(format.ext)) {
//     return true;
//   }

//   return false;
// }

// function formatDuration(seconds: number): string {
//   if (!seconds) return "";
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const remainingSeconds = seconds % 60;

//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
//       .toString()
//       .padStart(2, "0")}`;
//   }
//   return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
// }

// function formatNumber(num: number): string {
//   if (!num) return "";
//   if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
//   if (num >= 1000) return (num / 1000).toFixed(1) + "K";
//   return num.toString();
// }


import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("🎥 Fetching formats for:", url);

    let command = `yt-dlp -j --no-warnings --no-playlist --ignore-errors`;
    
    if (url.includes('tiktok.com')) {
      // 🚨 TIKTOK SPECIFIC API FIX (from Reddit solution)
      console.log("🔴 TikTok URL detected - using TikTok API fix");
      
      command += ` --extractor-args "tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com"`;
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      
      // Reduced timeouts for faster failure
      command += ` --socket-timeout 60`;
      command += ` --extractor-retries 2`;
      command += ` --fragment-retries 2`;
      command += ` --sleep-interval 1`;
      command += ` --max-sleep-interval 3`;
      command += ` --no-check-certificate`;
      command += ` --geo-bypass`;
      
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      // FACEBOOK CONFIGURATION
      console.log("🔵 Facebook URL detected - using Facebook optimizations");
      
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --extractor-retries 5`;
      command += ` --fragment-retries 3`;
      command += ` --socket-timeout 90`;
      command += ` --sleep-interval 3`;
      command += ` --max-sleep-interval 6`;
      command += ` --no-check-certificate`;
      command += ` --geo-bypass`;
      
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // YouTube configuration
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --extractor-retries 1`;
      command += ` --fragment-retries 1`;
      command += ` --sleep-interval 2`;
      command += ` --max-sleep-interval 5`;
      command += ` --socket-timeout 30`;
      command += ` --no-check-certificate`;
      command += ` --geo-bypass`;
      command += ` --mark-watched`;
      
    } else {
      // Other platforms
      command += ` --user-agent "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"`;
      command += ` --extractor-retries 3`;
      command += ` --socket-timeout 30`;
      command += ` --sleep-interval 1`;
      
      if (url.includes('instagram.com')) {
        command += ` --add-header "Referer:https://www.instagram.com/"`;
        command += ` --add-header "X-Requested-With:XMLHttpRequest"`;
      }
    }
    
    command += ` "${url}"`;

    console.log("🛡️ Executing platform-specific optimized command...");

    try {
      // Reduced timeout for TikTok
      const timeoutMs = url.includes('tiktok.com') ? 30000 : 60000; // 30s for TikTok, 1min for others
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 50,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        }
      });

      if (stderr) {
        console.log("⚠️ yt-dlp stderr:", stderr);

        // 🚨 TIKTOK SPECIFIC ERROR HANDLING
        if (url.includes('tiktok.com') && (stderr.includes("timed out") || stderr.includes("Connection timeout"))) {
          return NextResponse.json({
            success: false,
            error: "TikTok is currently blocking automated requests.\n\n" +
                   "This is very common and expected behavior. TikTok actively prevents video downloading tools.\n\n" +
                   "💡 Alternative solutions:\n" +
                   "• Try a different TikTok video\n" +
                   "• Use TikTok's built-in save feature\n" +
                   "• Try again later (TikTok blocks may be temporary)\n" +
                   "• Consider using dedicated TikTok downloader websites",
            suggestion: "TikTok actively blocks yt-dlp. This is normal and expected.",
            alternatives: [
              "SnapTik.app",
              "SaveTT.cc", 
              "TikMate.online",
              "SSSTikTok.io"
            ]
          }, { status: 408 });
        }

        // Facebook error handling
        if (url.includes('facebook.com') && stderr.includes("Unsupported URL")) {
          return NextResponse.json({
            success: false,
            error: "Facebook URL format not supported.\n\n" +
                   "✅ Supported formats:\n" +
                   "• facebook.com/watch?v=...\n" +
                   "• fb.watch/...\n\n" +
                   "❌ Not supported:\n" +
                   "• facebook.com/share/...\n" +
                   "• facebook.com/reel/...",
            suggestion: "Use classic Facebook video URLs.",
          }, { status: 400 });
        }

        // General error handling
        if (stderr.includes("HTTP Error 403") || stderr.includes("Forbidden")) {
          return NextResponse.json({
            success: false,
            error: "Access denied. Content may be private, region-blocked, or protected by anti-bot measures.",
          }, { status: 403 });
        }

        if (stderr.includes("Private video") || stderr.includes("Video unavailable")) {
          return NextResponse.json({
            success: false,
            error: "Video is private, deleted, or not available in your region.",
          }, { status: 404 });
        }

        // Continue if only warnings
        if (!stderr.includes("ERROR:")) {
          console.log("⚠️ Only warnings detected, continuing...");
        }
      }

      if (!stdout || stdout.trim() === "") {
        return NextResponse.json({
          success: false,
          error: "No video data received. Video may be unavailable, private, or protected.",
        }, { status: 500 });
      }

      // Parse JSON response
      let videoInfo;
      try {
        videoInfo = JSON.parse(stdout.trim());
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        return NextResponse.json({
          success: false,
          error: "Invalid response format from video source.",
        }, { status: 500 });
      }

      // Handle missing formats
      if (!videoInfo.formats || !Array.isArray(videoInfo.formats)) {
        if (videoInfo.url) {
          videoInfo.formats = [{
            format_id: 'best',
            url: videoInfo.url,
            ext: videoInfo.ext || 'mp4',
            quality: 'default',
            vcodec: 'h264',
            acodec: 'aac'
          }];
        } else {
          return NextResponse.json({
            success: false,
            error: "No downloadable formats available. Video may be restricted or protected.",
          }, { status: 500 });
        }
      }

      console.log(`✅ Found ${videoInfo.formats.length} formats for: ${videoInfo.title || "Unknown"}`);

      const processedFormats = processFormats(videoInfo.formats);

      return NextResponse.json({
        success: true,
        title: videoInfo.title || "Unknown Title",
        duration: formatDuration(videoInfo.duration),
        thumbnail: videoInfo.thumbnail || videoInfo.thumbnails?.[0]?.url,
        uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
        view_count: formatNumber(videoInfo.view_count),
        formats: processedFormats.all,
        recommended: processedFormats.recommended,
        videoOnly: processedFormats.videoOnly,
        audioOnly: processedFormats.audioOnly,
        combined: processedFormats.combined,
        platform: detectPlatform(url),
      });

    } catch (execError: any) {
      console.error("💥 yt-dlp execution error:", execError);

      let errorMessage = "Failed to get video information";
      let suggestion = "";

      if (execError.code === "ENOENT") {
        errorMessage = "yt-dlp not found. Please install yt-dlp on the server.";
      } else if (execError.signal === "SIGTERM" || execError.code === "TIMEOUT") {
        if (url.includes('tiktok.com')) {
          errorMessage = "TikTok blocked the request (this is normal)";
          suggestion = "TikTok actively prevents automated downloads. Try alternative TikTok downloaders.";
        } else {
          errorMessage = "Request timeout. Please try again.";
        }
      } else if (execError.stderr?.includes("timed out")) {
        if (url.includes('tiktok.com')) {
          errorMessage = "TikTok connection blocked (expected behavior)";
          suggestion = "TikTok has strong anti-bot protection. This is normal.";
        } else {
          errorMessage = "Connection timeout. Network or server issue.";
        }
      } else if (execError.stderr?.includes("Unsupported URL")) {
        if (url.includes('facebook.com')) {
          errorMessage = "Facebook URL format not supported";
          suggestion = "Use facebook.com/watch?v=... or fb.watch/... URLs";
        } else {
          errorMessage = "URL format not supported";
        }
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        suggestion: suggestion,
        details: url.includes('tiktok.com') ? "TikTok actively blocks video downloaders. This is expected." : "Platform protection may be active.",
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("💀 Format listing error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error while processing request",
    }, { status: 500 });
  }
}

// Rest of the functions remain the same...
function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook';
  return 'unknown';
}

function processFormats(formats: any[]) {
  const all: any[] = [];
  const recommended: any[] = [];
  const videoOnly: any[] = [];
  const audioOnly: any[] = [];
  const combined: any[] = [];
  
  const seenFormats = new Set<string>();

  formats.forEach((format) => {
    if (!format.format_id && !format.url) return;

    const processedFormat = {
      format_id: format.format_id || 'best',
      ext: format.ext || "mp4",
      quality: getQualityLabel(format),
      resolution: getResolution(format),
      filesize: getFileSize(format.filesize),
      filesizeMB: getFileSizeMB(format.filesize),
      fps: format.fps || null,
      vcodec: format.vcodec || 'h264',
      acodec: format.acodec || 'aac',
      tbr: format.tbr,
      type: getFormatType(format),
      note: format.format_note || "",
      isRecommended: isRecommendedFormat(format),
    };

    const uniqueKey = `${processedFormat.quality}_${processedFormat.ext}_${processedFormat.type}_${processedFormat.fps || 0}`;
    
    if (seenFormats.has(uniqueKey)) {
      console.log(`🔄 Skipping duplicate: ${processedFormat.quality} ${processedFormat.ext} (${processedFormat.format_id})`);
      return;
    }
    
    seenFormats.add(uniqueKey);
    all.push(processedFormat);

    if (processedFormat.type === "video+audio") {
      combined.push(processedFormat);
      if (processedFormat.isRecommended) {
        recommended.push(processedFormat);
      }
    } else if (processedFormat.type === "video") {
      videoOnly.push(processedFormat);
    } else if (processedFormat.type === "audio") {
      audioOnly.push(processedFormat);
    }
  });

  const sortByQuality = (a: any, b: any) => {
    const aHeight = parseInt(a.resolution) || 0;
    const bHeight = parseInt(b.resolution) || 0;
    return bHeight - aHeight;
  };

  const finalAll = removeSimilarFormats(all.sort(sortByQuality));
  const finalRecommended = removeSimilarFormats(recommended.sort(sortByQuality)).slice(0, 8);

  console.log(`✅ Processed ${formats.length} formats -> ${finalAll.length} unique formats`);

  return {
    all: finalAll,
    recommended: finalRecommended,
    videoOnly: removeSimilarFormats(videoOnly.sort(sortByQuality)),
    audioOnly: removeSimilarFormats(audioOnly),
    combined: removeSimilarFormats(combined.sort(sortByQuality)),
  };
}

function removeSimilarFormats(formats: any[]): any[] {
  const uniqueQualities = new Map<string, any>();
  
  formats.forEach(format => {
    const qualityKey = `${format.quality}_${format.type}`;
    
    if (!uniqueQualities.has(qualityKey)) {
      uniqueQualities.set(qualityKey, format);
    } else {
      const existing = uniqueQualities.get(qualityKey);
      
      if (format.ext === 'mp4' && existing.ext !== 'mp4') {
        uniqueQualities.set(qualityKey, format);
      } else if (format.filesizeMB > 0 && existing.filesizeMB === 0) {
        uniqueQualities.set(qualityKey, format);
      } else if (format.isRecommended && !existing.isRecommended) {
        uniqueQualities.set(qualityKey, format);
      }
    }
  });
  
  return Array.from(uniqueQualities.values());
}

function getQualityLabel(format: any): string {
  if (format.height) return `${format.height}p`;
  if (format.format_note) return format.format_note;
  if (format.abr) return `${format.abr}kbps`;
  return "default";
}

function getResolution(format: any): string {
  if (format.height && format.width) return `${format.width}x${format.height}`;
  if (format.height) return `${format.height}p`;
  return "audio";
}

function getFileSize(size: number | null): string {
  if (!size) return "unknown";
  const mb = size / (1024 * 1024);
  if (mb >= 1000) return `${(mb / 1024).toFixed(1)}GB`;
  return `${mb.toFixed(1)}MB`;
}

function getFileSizeMB(size: number | null): number {
  if (!size) return 0;
  return Math.round((size / (1024 * 1024)) * 10) / 10;
}

function getFormatType(format: any): string {
  const hasVideo = format.vcodec && format.vcodec !== "none";
  const hasAudio = format.acodec && format.acodec !== "none";
  
  if (hasVideo && hasAudio) return "video+audio";
  if (hasVideo && !hasAudio) return "video";
  if (!hasVideo && hasAudio) return "audio";
  return "video+audio";
}

function isRecommendedFormat(format: any): boolean {
  const hasVideo = format.vcodec && format.vcodec !== "none";
  const hasAudio = format.acodec && format.acodec !== "none";

  if (format.format_id === 'best') return true;
  if (hasVideo && hasAudio && format.ext === "mp4") return true;
  if (format.height && [360, 480, 720, 1080].includes(format.height) && hasAudio) return true;
  return false;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatNumber(num: number): string {
  if (!num) return "";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

