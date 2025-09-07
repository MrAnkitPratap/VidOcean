// import { NextRequest, NextResponse } from "next/server";
// import { spawn } from "child_process";
// import path from "path";
// import fs from "fs";
// import { activeDownloads } from "../shared/downloads";

// export async function POST(request: NextRequest) {
//   try {
//     const { url, platform, formatId } = await request.json();

//     if (!url) {
//       return NextResponse.json({ error: "URL is required" }, { status: 400 });
//     }

//     // Generate unique download ID
//     const downloadId =
//       Date.now().toString() + Math.random().toString(36).substr(2, 9);
//     console.log("🆔 Generated download ID:", downloadId);
//     console.log("🎯 Requested format:", formatId);

//     const downloadsDir = path.join(process.cwd(), "public", "downloads");
//     if (!fs.existsSync(downloadsDir)) {
//       fs.mkdirSync(downloadsDir, { recursive: true });
//     }

//     const timestamp = Date.now();
//     const sanitizedPlatform = (platform || "video").replace(
//       /[^a-zA-Z0-9]/g,
//       ""
//     );
//     const outputTemplate = path.join(
//       downloadsDir,
//       `${sanitizedPlatform}_${timestamp}.%(ext)s`
//     );

//     // ✅ CRITICAL: Add to activeDownloads IMMEDIATELY
//     activeDownloads.set(downloadId, {
//       progress: {
//         status: "starting",
//         percentage: 0,
//         speed: null,
//         eta: null,
//         downloaded: "0MB",
//         totalSize: null,
//         filename: null,
//         message: "Initializing download...",
//       },
//     });

//     console.log("✅ Added to activeDownloads:", downloadId);
//     console.log("📊 Active downloads count:", activeDownloads.size);

//     // 🎵 FIXED: Always include audio with video
//     let formatString;
//     if (!formatId || formatId === "auto") {
//       // Default: Best video + best audio combined
//       formatString = "bestvideo+bestaudio/best";
//     } else {
//       // Check if it's audio-only format
//       const audioOnlyFormats = [
//         "140",
//         "139",
//         "251",
//         "250",
//         "249",
//         "278",
//         "394",
//         "396",
//         "397",
//         "398",
//       ];

//       if (
//         audioOnlyFormats.includes(formatId) ||
//         formatId.toLowerCase().includes("audio")
//       ) {
//         // Audio only - no video
//         formatString = `${formatId}[ext=m4a]/${formatId}/bestaudio`;
//       } else {
//         // Video format - ALWAYS combine with best audio
//         formatString = `${formatId}+bestaudio/${formatId}/bestvideo+bestaudio/best`;
//       }
//     }

//     console.log("🎵 Using format string (with audio):", formatString);

//     const ytdlpArgs = [
//       "-f",
//       formatString,
//       "-o",
//       outputTemplate,
//       "--no-part",
//       "--no-continue",
//       "--no-overwrites",
//       // 🔧 CONDITIONAL: Only merge to mp4 for video formats
//       ...(formatString.includes("bestaudio") &&
//       !formatString.includes("[ext=m4a]")
//         ? ["--merge-output-format", "mp4"]
//         : []),
//       "--progress",
//       "--newline",
//       url,
//     ];

//     console.log("🚀 Starting download with args:", ytdlpArgs);

//     // Start download process asynchronously
//     setImmediate(() => {
//       startDownloadWithProgress(
//         ytdlpArgs,
//         downloadId,
//         sanitizedPlatform,
//         timestamp
//       );
//     });

//     return NextResponse.json({
//       success: true,
//       downloadId: downloadId,
//       message: "Download started! Track progress with SSE.",
//     });
//   } catch (error: any) {
//     console.error("💥 Download error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// function startDownloadWithProgress(
//   args: string[],
//   downloadId: string,
//   platform: string,
//   timestamp: number
// ) {
//   console.log("🎬 Starting yt-dlp process for:", downloadId);

//   const ytdlp = spawn("yt-dlp", args);
//   let hasError = false;

//   // Update status to downloading
//   if (activeDownloads.has(downloadId)) {
//     activeDownloads.get(downloadId).progress.status = "downloading";
//     activeDownloads.get(downloadId).progress.message = "Download started...";
//     console.log("📝 Updated status to downloading");
//   }

//   ytdlp.stdout.on("data", (data) => {
//     parseProgress(data.toString(), downloadId);
//   });

//   ytdlp.stderr.on("data", (data) => {
//     parseProgress(data.toString(), downloadId);
//   });

//   ytdlp.on("close", (code) => {
//     console.log(`🏁 yt-dlp finished with code: ${code} for ${downloadId}`);

//     if (code === 0 && !hasError) {
//       try {
//         const downloadsDir = path.join(process.cwd(), "public", "downloads");
//         const files = fs.readdirSync(downloadsDir);
//         const downloadedFile = files.find((file) =>
//           file.includes(`${platform}_${timestamp}`)
//         );

//         if (downloadedFile) {
//           const fileStats = fs.statSync(
//             path.join(downloadsDir, downloadedFile)
//           );
//           const download = activeDownloads.get(downloadId);
//           if (download) {
//             download.progress = {
//               ...download.progress,
//               status: "completed",
//               percentage: 100,
//               filename: downloadedFile,
//               fileSize: Math.round(fileStats.size / (1024 * 1024)),
//               message: "Download completed successfully!",
//             };
//             console.log("✅ Download completed:", downloadedFile);
//           }
//         } else {
//           console.log(
//             "❌ Downloaded file not found, searching in:",
//             downloadsDir
//           );
//           console.log("📁 Available files:", files);
//           updateProgressError(downloadId, "Downloaded file not found");
//         }
//       } catch (err) {
//         console.error("File processing error:", err);
//         updateProgressError(downloadId, "File processing failed");
//       }
//     } else {
//       updateProgressError(downloadId, `Download failed with code ${code}`);
//     }
//   });

//   ytdlp.on("error", (error) => {
//     hasError = true;
//     console.error("💥 yt-dlp error:", error);
//     updateProgressError(downloadId, `Process error: ${error.message}`);
//   });
// }

// function parseProgress(output: string, downloadId: string) {
//   if (!activeDownloads.has(downloadId)) return;

//   const download = activeDownloads.get(downloadId);
//   const lines = output.split("\n");

//   for (const line of lines) {
//     // 🔧 ENHANCED: Multiple regex patterns to catch all yt-dlp progress formats

//     // Pattern 1: [download]  45.2% of  120.5MiB at  2.3MiB/s ETA 00:25 (your original)
//     let progressMatch = line.match(
//       /\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+(\d{2}:\d{2})/
//     );

//     // Pattern 2: [download] 45.2% of 120.5MiB at 2.3MiB/s (without ETA)
//     if (!progressMatch) {
//       progressMatch = line.match(
//         /\[download\]\s*(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)/
//       );
//     }

//     // Pattern 3: [download] 45.2% of ~120.5MiB (with estimated size ~)
//     if (!progressMatch) {
//       progressMatch = line.match(
//         /\[download\]\s*(\d{1,3}(?:\.\d+)?)%\s+of\s+~?([^\s]+)/
//       );
//     }

//     // Pattern 4: Simple [download] 45.2% (minimal format)
//     if (!progressMatch) {
//       const simpleMatch = line.match(/\[download\]\s*(\d{1,3}(?:\.\d+)?)%/);
//       if (simpleMatch) {
//         const percentage = parseFloat(simpleMatch[1]);
//         console.log(`📈 Progress: ${percentage}%`); // Debug log

//         download.progress = {
//           ...download.progress,
//           status: "downloading",
//           percentage: percentage,
//           message: "Downloading...",
//         };
//         return;
//       }
//     }

//     // If we found a match with more details
//     if (progressMatch) {
//       const [, percentage, totalSizeStr, speedStr, etaStr] = progressMatch;
//       const parsedPercentage = parseFloat(percentage);

//       console.log(
//         `📊 Progress: ${parsedPercentage}% of ${totalSizeStr || "unknown"}`
//       ); // Debug log

//       download.progress = {
//         ...download.progress,
//         status: "downloading",
//         percentage: parsedPercentage,
//         speed: speedStr ? speedStr.replace("iB", "B") : null,
//         eta: etaStr || null,
//         totalSize: totalSizeStr ? totalSizeStr.replace("iB", "B") : null,
//         downloaded: totalSizeStr
//           ? `${(
//               (parsedPercentage / 100) *
//               parseFloat(totalSizeStr.replace(/[^\d.]/g, ""))
//             ).toFixed(1)}MB`
//           : `${parsedPercentage}%`,
//         message: "Downloading...",
//       };
//       return;
//     }

//     // Parse completed (your original code)
//     const completedMatch = line.match(
//       /\[download\]\s+100%\s+of\s+([^\s]+)\s+in\s+(\d{2}:\d{2})/
//     );

//     if (completedMatch) {
//       console.log("🏁 Download completed, processing..."); // Debug log
//       download.progress = {
//         ...download.progress,
//         status: "processing",
//         percentage: 100,
//         message: "Processing and merging...",
//       };
//       return;
//     }

//     // Check for errors (your original code)
//     if (line.includes("ERROR")) {
//       console.log("❌ Error in output:", line); // Debug log
//       updateProgressError(downloadId, line.substring(line.indexOf("ERROR")));
//       return;
//     }

//     // 🔧 NEW: Debug unmatched progress lines
//     if (line.includes("[download]") && line.includes("%")) {
//       console.log("🔍 Unmatched progress line:", line);
//     }
//   }
// }

// function updateProgressError(downloadId: string, error: string) {
//   if (activeDownloads.has(downloadId)) {
//     const download = activeDownloads.get(downloadId);
//     download.progress = {
//       ...download.progress,
//       status: "error",
//       error: error,
//       message: "Download failed",
//     };
//     console.error("❌ Download error for", downloadId, ":", error);
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const MAX_CONCURRENT_DOWNLOADS = 50;
const activeDownloads = new Map();
let currentActiveDownloads = 0;

export async function POST(request: NextRequest) {
  try {
    const { url, platform, formatId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (currentActiveDownloads >= MAX_CONCURRENT_DOWNLOADS) {
      return NextResponse.json({ 
        error: "Server busy. Please try again in a few seconds." 
      }, { status: 503 });
    }

    currentActiveDownloads++;

    const downloadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    console.log(`🆔 Generated download ID: ${downloadId} (${currentActiveDownloads}/${MAX_CONCURRENT_DOWNLOADS})`);

    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedPlatform = (platform || "video").replace(/[^a-zA-Z0-9]/g, "");
    const outputTemplate = path.join(downloadsDir, `${sanitizedPlatform}_${timestamp}.%(ext)s`);

    activeDownloads.set(downloadId, {
      progress: {
        status: "starting",
        percentage: 0,
        speed: null,
        eta: null,
        downloaded: "0MB",
        totalSize: null,
        filename: null,
        message: "Starting silent download...",
      },
    });

    const detectedPlatform = detectPlatform(url);
    console.log(`🎯 Detected platform: ${detectedPlatform}`);

    let ytdlpArgs;

    if (detectedPlatform === 'tiktok') {
      // 🔥 TIKTOK ANTI-TIMEOUT CONFIGURATION
      ytdlpArgs = [
        "-f", "best[ext=mp4]/best",
        "-o", outputTemplate,
        
        // 🔇 SILENT MODE
        "--quiet",
        "--no-warnings",
        
        // 🚨 TIKTOK ANTI-BOT & TIMEOUT FIXES
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--add-header", "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "--add-header", "Accept-Language:en-US,en;q=0.9",
        "--add-header", "Accept-Encoding:gzip, deflate",
        "--add-header", "DNT:1",
        "--add-header", "Connection:keep-alive",
        "--add-header", "Upgrade-Insecure-Requests:1",
        
        // 🔥 EXTENDED TIMEOUTS FOR TIKTOK
        "--socket-timeout", "120",       // 2 minutes timeout
        "--retries", "10",               // More retries
        "--fragment-retries", "8",       // More fragment retries
        "--extractor-retries", "5",      // Extractor retries
        "--sleep-interval", "3",         // Longer sleep between requests
        "--max-sleep-interval", "8",     // Max sleep
        
        // Performance settings (conservative for TikTok)
        "--concurrent-fragments", "2",   // Less aggressive
        "--http-chunk-size", "1048576",  // 1MB chunks
        "--buffer-size", "8192",         // 8KB buffer
        
        "--no-check-certificate",
        "--no-part",
        "--no-continue",
        "--no-playlist",
        "--geo-bypass",                  // Try geo bypass
        "--progress",
        "--newline",
        url,
      ];
    } else if (detectedPlatform === 'facebook') {
      // FACEBOOK CONFIGURATION
      ytdlpArgs = [
        "-f", "best[ext=mp4]/best",
        "-o", outputTemplate,
        
        "--quiet",
        "--no-warnings",
        
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--add-header", "Accept-Language:en-US,en;q=0.9",
        
        "--concurrent-fragments", "2",
        "--fragment-retries", "5",
        "--http-chunk-size", "2097152",
        "--buffer-size", "16384",
        
        "--no-check-certificate",
        "--no-part",
        "--no-continue",
        "--no-playlist",
        "--retries", "8",
        "--socket-timeout", "90",
        "--sleep-interval", "3",
        "--max-sleep-interval", "6",
        "--progress",
        "--newline",
        url,
      ];
    } else if (detectedPlatform === 'instagram') {
  // 🔥 INSTAGRAM WITHOUT COOKIES WORKAROUND
  ytdlpArgs = [
    "-f", "best[ext=mp4]/best",
    "-o", outputTemplate,
    
    "--quiet",
    "--no-warnings",
    
    // 🚨 INSTAGRAM ANTI-BOT HEADERS (No cookies needed)
    "--user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "--add-header", "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "--add-header", "Accept-Language:en-US,en;q=0.5",
    "--add-header", "Accept-Encoding:gzip, deflate, br",
    "--add-header", "DNT:1",
    "--add-header", "Connection:keep-alive",
    "--add-header", "Upgrade-Insecure-Requests:1",
    "--add-header", "Sec-Fetch-Dest:document",
    "--add-header", "Sec-Fetch-Mode:navigate",
    "--add-header", "Sec-Fetch-Site:none",
    "--add-header", "Sec-GPC:1",
    
    // 🔄 RATE LIMITING & RETRY STRATEGY
    "--sleep-interval", "5",         // 5 second delay between requests
    "--max-sleep-interval", "15",    // Max 15 second delay
    "--retries", "8",                // More retries
    "--fragment-retries", "5",       // Fragment retries
    "--extractor-retries", "3",      // Extractor retries
    "--socket-timeout", "120",       // 2 minute timeout
    
    // 🎭 STEALTH MODE SETTINGS
    "--no-check-certificate",
    "--no-part",
    "--no-continue",
    "--no-playlist",
    "--geo-bypass",
    "--age-limit", "100",           // Bypass age restrictions
    
    // 🚀 PERFORMANCE (Conservative for Instagram)
    "--concurrent-fragments", "1",   // Single thread to avoid detection
    "--http-chunk-size", "1048576", // 1MB chunks
    "--buffer-size", "8192",        // Small buffer
    
    // 📱 MOBILE EXTRACTION FALLBACK
    "--extractor-args", "instagram:api_version=v1",
    
    "--progress",
    "--newline",
    url,
  ];
    }
    else if (detectedPlatform === 'youtube') {
      const formatString = formatId && formatId !== "auto" 
        ? `${formatId}+bestaudio/${formatId}/best[height<=720]`
        : "best[height<=720]/best";

      ytdlpArgs = [
        "-f", formatString,
        "-o", outputTemplate,
        
        "--quiet",
        "--no-warnings",
        
        "--concurrent-fragments", "6",
        "--fragment-retries", "3", 
        "--http-chunk-size", "8388608",
        "--buffer-size", "65536",
        
        "--extractor-args", "youtube:player_client=web",
        "--extractor-args", "youtube:skip=dash",
        
        "--no-check-certificate",
        "--no-part",
        "--no-continue",
        "--no-playlist",
        "--retries", "5",
        "--socket-timeout", "60",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--sleep-interval", "1",
        "--max-sleep-interval", "2",
        
        ...(formatString.includes("+bestaudio") ? ["--merge-output-format", "mp4"] : []),
        
        "--progress",
        "--newline",
        url,
      ];
    } else {
      ytdlpArgs = [
        "-f", "best[height<=720]/best",
        "-o", outputTemplate,
        
        "--quiet",
        "--no-warnings",
        
        "--concurrent-fragments", "3",
        "--fragment-retries", "2",
        "--http-chunk-size", "3145728",
        "--buffer-size", "16384",
        
        "--no-check-certificate",
        "--no-part",
        "--no-continue",
        "--no-playlist",
        "--retries", "3",
        "--socket-timeout", "30",
        "--progress",
        "--newline",
        url,
      ];
    }

    console.log("🔇 Starting SILENT download");

    setImmediate(() => {
      startSilentDownload(ytdlpArgs, downloadId, sanitizedPlatform, timestamp, detectedPlatform);
    });

    return NextResponse.json({
      success: true,
      downloadId: downloadId,
      message: `${detectedPlatform} silent download started!`,
    });

  } catch (error: any) {
    currentActiveDownloads--;
    console.error("💥 Download error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function detectPlatform(url: string): string {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('instagram.com')) return 'instagram';
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
  if (cleanUrl.includes('tiktok.com')) return 'tiktok';
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) return 'facebook';
  return 'generic';
}

function startSilentDownload(args: string[], downloadId: string, platform: string, timestamp: number, detectedPlatform: string) {
  console.log(`🔇 Starting SILENT ${detectedPlatform} download for:`, downloadId);

  // 🔥 EXTENDED TIMEOUT FOR TIKTOK
  const timeoutMs = detectedPlatform === 'tiktok' ? 180000 : 60000; // 3 minutes for TikTok, 1 minute for others

  const ytdlp = spawn("yt-dlp", args, {
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    timeout: timeoutMs
  });

  let hasError = false;
  const startTime = Date.now();

  if (activeDownloads.has(downloadId)) {
    activeDownloads.get(downloadId).progress.status = "downloading";
    activeDownloads.get(downloadId).progress.message = `${detectedPlatform} downloading silently...`;
  }

  ytdlp.stdout.on("data", (data) => {
    parseSilentProgress(data.toString(), downloadId);
  });

  ytdlp.stderr.on("data", (data) => {
    const output = data.toString();
    
    // 🚨 PLATFORM SPECIFIC ERROR HANDLING
    if (detectedPlatform === 'tiktok' && (output.includes("timed out") || output.includes("Connection timeout"))) {
      console.log("❌ TikTok connection timeout - anti-bot protection active");
      updateProgressError(downloadId, 
        "TikTok download failed due to connection timeout. This is likely due to:\n" +
        "• TikTok's anti-bot protection\n" +
        "• Network connectivity issues\n" +
        "• Regional blocking\n" +
        "Try again in a few minutes or use a different TikTok URL.", 
        detectedPlatform
      );
      return;
    }

    if (detectedPlatform === 'facebook' && output.includes("Unsupported URL")) {
      console.log("❌ Facebook URL not supported by yt-dlp");
      updateProgressError(downloadId, 
        "Facebook URL format not supported. Use: facebook.com/watch?v=... or fb.watch/... URLs", 
        detectedPlatform
      );
      return;
    }
    
    // Only log actual ERRORS
    if (output.includes("ERROR") && 
        !output.includes("nsig") && 
        !output.includes("WARNING") &&
        !output.includes("Falling back")) {
      console.log(`❌ ${detectedPlatform} ERROR:`, output.trim());
    }
    
    parseSilentProgress(output, downloadId);
  });

  ytdlp.on("close", (code) => {
    currentActiveDownloads--;
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`🏁 ${detectedPlatform} SILENT download finished: code ${code} | ${duration.toFixed(1)}s`);

    if (code === 0 && !hasError) {
      setTimeout(() => {
        try {
          const downloadsDir = path.join(process.cwd(), "public", "downloads");
          const files = fs.readdirSync(downloadsDir);
          
          const downloadedFile = files.find(file => 
            file.includes(`${platform}_${timestamp}`) || 
            (file.includes(platform) && (file.includes('.mp4') || file.includes('.webm')))
          );

          if (downloadedFile) {
            const filePath = path.join(downloadsDir, downloadedFile);
            const fileStats = fs.statSync(filePath);
            
            if (fileStats.size > 1024) {
              const sizeMB = fileStats.size / (1024 * 1024);
              const speedMBps = duration > 0 ? sizeMB / duration : 0;
              
              console.log(`✅ SILENT SUCCESS: ${downloadedFile} (${sizeMB.toFixed(1)}MB @ ${speedMBps.toFixed(1)}MB/s)`);
              
              const download = activeDownloads.get(downloadId);
              if (download) {
                download.progress = {
                  ...download.progress,
                  status: "completed",
                  percentage: 100,
                  filename: downloadedFile,
                  fileSize: Math.round(sizeMB),
                  message: `${detectedPlatform} completed silently! ${speedMBps.toFixed(1)} MB/s`,
                };
              }
            } else {
              updateProgressError(downloadId, "File too small", detectedPlatform);
            }
          } else {
            updateProgressError(downloadId, "File not found", detectedPlatform);
          }
        } catch (err) {
          updateProgressError(downloadId, "File processing error", detectedPlatform);
        }
      }, 1500);
    } else {
      // Better error messages for specific platforms
      if (detectedPlatform === 'tiktok') {
        updateProgressError(downloadId, 
          `TikTok download failed. Common reasons:\n` +
          `• Connection timeout (TikTok anti-bot protection)\n` +
          `• Video may be private or deleted\n` +
          `• Regional restrictions\n` +
          `• Network connectivity issues\n\n` +
          `Try: Different TikTok video or wait 5-10 minutes`, 
          detectedPlatform
        );
      } else if (detectedPlatform === 'facebook') {
        updateProgressError(downloadId, 
          `Facebook download failed. Use supported URLs:\n` +
          `✅ facebook.com/watch?v=...\n` +
          `✅ fb.watch/...\n` +
          `❌ facebook.com/share/...\n` +
          `❌ facebook.com/reel/...`, 
          detectedPlatform
        );
      } else {
        updateProgressError(downloadId, `Download failed (code: ${code})`, detectedPlatform);
      }
    }
  });

  ytdlp.on("error", (error) => {
    hasError = true;
    currentActiveDownloads--;
    console.error(`💥 ${detectedPlatform} PROCESS ERROR:`, error.message);
    updateProgressError(downloadId, `Process error: ${error.message}`, detectedPlatform);
  });
}

function parseSilentProgress(output: string, downloadId: string) {
  if (!activeDownloads.has(downloadId)) return;

  const download = activeDownloads.get(downloadId);
  const lines = output.split("\n");

  for (const line of lines) {
    let progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)(?:\s+ETA\s+(\d{2}:\d{2}))?/);
    
    if (!progressMatch) {
      progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%/);
    }
    
    if (progressMatch) {
      const percentage = parseFloat(progressMatch[1]);
      const totalSize = progressMatch[2] || null;
      const speed = progressMatch[3] || null;
      const eta = progressMatch[4] || null;
      
      download.progress = {
        ...download.progress,
        status: "downloading",
        percentage: percentage,
        speed: speed ? speed.replace("iB", "B") : null,
        eta: eta,
        totalSize: totalSize ? totalSize.replace("iB", "B") : null,
        message: `Silent download... ${percentage.toFixed(1)}%`,
      };
      return;
    }

    if (line.includes("[download] 100%") || line.includes("has already been downloaded")) {
      download.progress = {
        ...download.progress,
        status: "processing",
        percentage: 100,
        message: "Finalizing silent download...",
      };
      return;
    }
  }
}

function updateProgressError(downloadId: string, error: string, platform: string) {
  if (activeDownloads.has(downloadId)) {
    const download = activeDownloads.get(downloadId);
    download.progress = {
      ...download.progress,
      status: "error",
      error: error,
      message: `${platform} silent download failed`,
    };
    console.error(`❌ ${platform} SILENT ERROR:`, error);
  }
}

export { activeDownloads };





// import { NextRequest, NextResponse } from "next/server";
// import { spawn } from "child_process";
// import path from "path";
// import fs from "fs";

// const MAX_CONCURRENT_DOWNLOADS = 50;
// const activeDownloads = new Map();
// let currentActiveDownloads = 0;

// export async function POST(request: NextRequest) {
//   try {
//     const { url, platform, formatId } = await request.json();

//     if (!url) {
//       return NextResponse.json({ error: "URL is required" }, { status: 400 });
//     }

//     if (currentActiveDownloads >= MAX_CONCURRENT_DOWNLOADS) {
//       return NextResponse.json({ 
//         error: "Server busy. Please try again in a few seconds." 
//       }, { status: 503 });
//     }

//     currentActiveDownloads++;

//     const downloadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
//     console.log(`🆔 Generated download ID: ${downloadId} (${currentActiveDownloads}/${MAX_CONCURRENT_DOWNLOADS})`);

//     const downloadsDir = path.join(process.cwd(), "public", "downloads");
//     if (!fs.existsSync(downloadsDir)) {
//       fs.mkdirSync(downloadsDir, { recursive: true });
//     }

//     const timestamp = Date.now();
//     const sanitizedPlatform = (platform || "video").replace(/[^a-zA-Z0-9]/g, "");
//     const outputTemplate = path.join(downloadsDir, `${sanitizedPlatform}_${timestamp}.%(ext)s`);

//     activeDownloads.set(downloadId, {
//       progress: {
//         status: "starting",
//         percentage: 0,
//         speed: null,
//         eta: null,
//         downloaded: "0MB",
//         totalSize: null,
//         filename: null,
//         message: "Starting optimized download...",
//         downloadSpeed: null,
//         downloadTime: null,
//       },
//     });

//     const detectedPlatform = detectPlatform(url);
//     console.log(`🎯 Detected platform: ${detectedPlatform}`);

//     let ytdlpArgs;

//     if (detectedPlatform === 'instagram') {
//       ytdlpArgs = [
//         "-f", "best[ext=mp4]/best",
//         "-o", outputTemplate,
        
//         // Instagram optimized (no aria2c for Instagram - causes issues)
//         "--concurrent-fragments", "3",
//         "--fragment-retries", "2",
//         "--http-chunk-size", "5242880",      // 5MB chunks
//         "--buffer-size", "16384",            // 16KB buffer
        
//         "--no-check-certificate",
//         "--no-part",
//         "--no-continue",
//         "--no-playlist",
//         "--user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
//         "--add-header", "Referer:https://www.instagram.com/",
//         "--retries", "3",
//         "--socket-timeout", "30",
//         "--progress",
//         "--newline",
//         url,
//       ];
//     // यह option भी try करो - TV client doesn't need PO Token
// // YouTube args में यह change करो:
// } else if (detectedPlatform === 'youtube') {
//   const formatString = formatId && formatId !== "auto" 
//     ? `${formatId}+bestaudio/${formatId}/best[height<=720]`
//     : "best[height<=720]/best";

//   ytdlpArgs = [
//     "-f", formatString,
//     "-o", outputTemplate,
    
//     // ⚡ SPEED BOOSTERS
//     "--concurrent-fragments", "4",
//     "--fragment-retries", "3",
//     "--http-chunk-size", "5242880",     // 5MB chunks
//     "--buffer-size", "32768",
    
//     // 🚀 ARIA2C with conservative settings
//     "--external-downloader", "aria2c",
//     "--external-downloader-args", "-c -j 2 -x 2 -s 2 -t 30 --retry-wait=3 --max-tries=3",
    
//     // 🔥 BYPASS PO TOKEN ISSUES - Use multiple client fallback
//     "--extractor-args", "youtube:player_client=web,tv_embedded",  // Fallback clients
//     "--extractor-args", "youtube:formats=missing_pot",  // Allow formats without PO token
    
//     "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    
//     "--no-check-certificate",
//     "--no-part",
//     "--no-continue", 
//     "--no-playlist",
//     "--retries", "5",
//     "--socket-timeout", "60",
//     "--sleep-interval", "2",
//     "--max-sleep-interval", "5",
    
//     // Audio merge
//     ...(formatString.includes("+bestaudio") ? ["--merge-output-format", "mp4"] : []),
    
//     "--progress",
//     "--newline",
//     url,
//   ];
// }

//  else {
//       ytdlpArgs = [
//         "-f", "best[height<=720]/best",
//         "-o", outputTemplate,
        
//         // Generic platforms - simple and reliable
//         "--concurrent-fragments", "3",
//         "--fragment-retries", "2",
//         "--http-chunk-size", "3145728",      // 3MB chunks
//         "--buffer-size", "16384",
        
//         "--no-check-certificate",
//         "--no-part", 
//         "--no-continue",
//         "--no-playlist",
//         "--retries", "3",
//         "--socket-timeout", "30",
//         "--progress",
//         "--newline",
//         url,
//       ];
//     }

//     console.log("🚀 Starting optimized download");

//     setImmediate(() => {
//       startRobustDownload(ytdlpArgs, downloadId, sanitizedPlatform, timestamp, detectedPlatform);
//     });

//     return NextResponse.json({
//       success: true,
//       downloadId: downloadId,
//       message: `${detectedPlatform} optimized download started!`,
//     });

//   } catch (error: any) {
//     currentActiveDownloads--;
//     console.error("💥 Download error:", error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// function detectPlatform(url: string): string {
//   const cleanUrl = url.toLowerCase();
//   if (cleanUrl.includes('instagram.com')) return 'instagram';
//   if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
//   if (cleanUrl.includes('tiktok.com')) return 'tiktok';
//   if (cleanUrl.includes('facebook.com')) return 'facebook';
//   return 'generic';
// }

// function startRobustDownload(args: string[], downloadId: string, platform: string, timestamp: number, detectedPlatform: string) {
//   console.log(`🚀 Starting ${detectedPlatform} robust download for:`, downloadId);

//   const ytdlp = spawn("yt-dlp", args, {
//     env: { ...process.env, PYTHONUNBUFFERED: '1' },
//     timeout: 300000  // 5 minute timeout
//   });

//   let hasError = false;
//   let errorCount = 0;
//   const startTime = Date.now();

//   if (activeDownloads.has(downloadId)) {
//     activeDownloads.get(downloadId).progress.status = "downloading";
//     activeDownloads.get(downloadId).progress.message = `${detectedPlatform} downloading...`;
//   }

//   ytdlp.stdout.on("data", (data) => {
//     parseRobustProgress(data.toString(), downloadId);
//   });

//   ytdlp.stderr.on("data", (data) => {
//     const output = data.toString();
//     console.log(`⚠️ ${detectedPlatform} stderr:`, output);
    
//     // 🔥 HANDLE SPECIFIC ERRORS
//     if (output.includes("aria2c")) {
//       console.log("🔥 Using aria2c for speed boost!");
//     }
    
//     // YouTube nsig warnings are OK - don't treat as errors
//     if (output.includes("nsig extraction failed") || 
//         output.includes("Falling back to generic")) {
//       console.log("⚠️ YouTube anti-bot protection - continuing anyway");
//       return; // Don't treat as error
//     }
    
//     // Only count real errors
//     if (output.includes("ERROR") && !output.includes("Download aborted")) {
//       errorCount++;
//       console.log(`❌ Error count: ${errorCount}`);
      
//       if (errorCount > 10) { // Too many errors
//         hasError = true;
//         updateProgressError(downloadId, "Too many download errors", detectedPlatform);
//         ytdlp.kill();
//       }
//     }
    
//     parseRobustProgress(output, downloadId);
//   });

//   ytdlp.on("close", (code) => {
//     currentActiveDownloads--;
    
//     const endTime = Date.now();
//     const duration = (endTime - startTime) / 1000;
//     console.log(`🏁 ${detectedPlatform} download finished with code: ${code} for ${downloadId}`);
//     console.log(`⏱️ Total time: ${duration.toFixed(2)} seconds`);

//     // Success conditions - be more lenient
//     if ((code === 0 || errorCount < 5) && !hasError) {
//       setTimeout(() => {
//         try {
//           const downloadsDir = path.join(process.cwd(), "public", "downloads");
//           const files = fs.readdirSync(downloadsDir);
//           console.log(`📁 Files in downloads:`, files);
          
//           // Better file detection
//           const downloadedFile = files.find(file => 
//             file.includes(`${platform}_${timestamp}`) || 
//             (file.includes(platform) && (file.includes('.mp4') || file.includes('.webm') || file.includes('.mkv')))
//           );

//           if (downloadedFile) {
//             const filePath = path.join(downloadsDir, downloadedFile);
//             const fileStats = fs.statSync(filePath);
            
//             if (fileStats.size > 1024) { // At least 1KB file
//               const sizeMB = fileStats.size / (1024 * 1024);
//               const speedMBps = duration > 0 ? sizeMB / duration : 0;
              
//               console.log(`📊 File: ${downloadedFile} (${sizeMB.toFixed(2)}MB)`);
//               console.log(`🚀 Speed: ${speedMBps.toFixed(2)} MB/s`);
              
//               const download = activeDownloads.get(downloadId);
//               if (download) {
//                 download.progress = {
//                   ...download.progress,
//                   status: "completed",
//                   percentage: 100,
//                   filename: downloadedFile,
//                   fileSize: Math.round(sizeMB),
//                   message: `${detectedPlatform} download completed! (${speedMBps.toFixed(1)} MB/s)`,
//                   downloadSpeed: `${speedMBps.toFixed(2)} MB/s`,
//                   downloadTime: `${duration.toFixed(1)}s`
//                 };
//                 console.log(`✅ ${detectedPlatform} SUCCESS:`, downloadedFile);
//               }
//             } else {
//               updateProgressError(downloadId, "Downloaded file too small", detectedPlatform);
//             }
//           } else {
//             // Try again with broader search
//             const anyVideoFile = files.find(file => 
//               file.includes('.mp4') || file.includes('.webm') || file.includes('.mkv')
//             );
            
//             if (anyVideoFile) {
//               console.log(`🔍 Found alternative file: ${anyVideoFile}`);
//               const filePath = path.join(downloadsDir, anyVideoFile);
//               const fileStats = fs.statSync(filePath);
              
//               if (fileStats.size > 1024) {
//                 const download = activeDownloads.get(downloadId);
//                 if (download) {
//                   download.progress = {
//                     ...download.progress,
//                     status: "completed",
//                     percentage: 100,
//                     filename: anyVideoFile,
//                     fileSize: Math.round(fileStats.size / (1024 * 1024)),
//                     message: `${detectedPlatform} download completed!`,
//                   };
//                 }
//               } else {
//                 updateProgressError(downloadId, "No valid video file found", detectedPlatform);
//               }
//             } else {
//               updateProgressError(downloadId, "No video file generated", detectedPlatform);
//             }
//           }
//         } catch (err) {
//           console.error("File detection error:", err);
//           updateProgressError(downloadId, "Error processing downloaded file", detectedPlatform);
//         }
//       }, 3000); // Wait 3 seconds for file system
//     } else {
//       updateProgressError(downloadId, `Download failed (code: ${code}, errors: ${errorCount})`, detectedPlatform);
//     }
//   });

//   ytdlp.on("error", (error) => {
//     hasError = true;
//     currentActiveDownloads--;
//     console.error(`💥 ${detectedPlatform} process error:`, error);
//     updateProgressError(downloadId, `Process error: ${error.message}`, detectedPlatform);
//   });
// }

// function parseRobustProgress(output: string, downloadId: string) {
//   if (!activeDownloads.has(downloadId)) return;

//   const download = activeDownloads.get(downloadId);
//   const lines = output.split("\n");

//   for (const line of lines) {
//     // Multiple progress patterns
//     let progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)(?:\s+ETA\s+(\d{2}:\d{2}))?/);
    
//     if (!progressMatch) {
//       progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%/);
//     }
    
//     if (progressMatch) {
//       const percentage = parseFloat(progressMatch[1]);
//       const totalSize = progressMatch[2] || null;
//       const speed = progressMatch[3] || null;
//       const eta = progressMatch[4] || null;
      
//       download.progress = {
//         ...download.progress,
//         status: "downloading",
//         percentage: percentage,
//         speed: speed ? speed.replace("iB", "B") : null,
//         eta: eta,
//         totalSize: totalSize ? totalSize.replace("iB", "B") : null,
//         message: `Downloading... ${percentage.toFixed(1)}%`,
//       };
//       return;
//     }

//     if (line.includes("[download] 100%") || line.includes("has already been downloaded")) {
//       download.progress = {
//         ...download.progress,
//         status: "processing",
//         percentage: 100,
//         message: "Finalizing download...",
//       };
//       return;
//     }

//     // Don't treat aria2c connection errors as fatal
//     if (line.includes("ERROR") && 
//         !line.includes("Download aborted") && 
//         !line.includes("CUID#")) {
//       console.log(`⚠️ Non-fatal error: ${line}`);
//     }
//   }
// }

// function updateProgressError(downloadId: string, error: string, platform: string) {
//   if (activeDownloads.has(downloadId)) {
//     const download = activeDownloads.get(downloadId);
//     download.progress = {
//       ...download.progress,
//       status: "error",
//       error: error,
//       message: `${platform} download failed: ${error}`,
//     };
//     console.error(`❌ ${platform} error for ${downloadId}:`, error);
//   }
// }

// export { activeDownloads };
