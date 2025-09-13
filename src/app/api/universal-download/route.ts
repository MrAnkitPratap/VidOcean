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
//         message: "Starting silent download...",
//       },
//     });

//     const detectedPlatform = detectPlatform(url);
//     console.log(`🎯 Detected platform: ${detectedPlatform}`);

//     let ytdlpArgs;

//     if (detectedPlatform === 'tiktok') {
//       // 🔥 TIKTOK ANTI-TIMEOUT CONFIGURATION
//       ytdlpArgs = [
//         "-f", "best[ext=mp4]/best",
//         "-o", outputTemplate,

//         // 🔇 SILENT MODE
//         "--quiet",
//         "--no-warnings",

//         // 🚨 TIKTOK ANTI-BOT & TIMEOUT FIXES
//         "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         "--add-header", "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
//         "--add-header", "Accept-Language:en-US,en;q=0.9",
//         "--add-header", "Accept-Encoding:gzip, deflate",
//         "--add-header", "DNT:1",
//         "--add-header", "Connection:keep-alive",
//         "--add-header", "Upgrade-Insecure-Requests:1",

//         // 🔥 EXTENDED TIMEOUTS FOR TIKTOK
//         "--socket-timeout", "120",       // 2 minutes timeout
//         "--retries", "10",               // More retries
//         "--fragment-retries", "8",       // More fragment retries
//         "--extractor-retries", "5",      // Extractor retries
//         "--sleep-interval", "3",         // Longer sleep between requests
//         "--max-sleep-interval", "8",     // Max sleep

//         // Performance settings (conservative for TikTok)
//         "--concurrent-fragments", "2",   // Less aggressive
//         "--http-chunk-size", "1048576",  // 1MB chunks
//         "--buffer-size", "8192",         // 8KB buffer

//         "--no-check-certificate",
//         "--no-part",
//         "--no-continue",
//         "--no-playlist",
//         "--geo-bypass",                  // Try geo bypass
//         "--progress",
//         "--newline",
//         url,
//       ];
//     } else if (detectedPlatform === 'facebook') {
//       // FACEBOOK CONFIGURATION
//       ytdlpArgs = [
//         "-f", "best[ext=mp4]/best",
//         "-o", outputTemplate,

//         "--quiet",
//         "--no-warnings",

//         "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         "--add-header", "Accept-Language:en-US,en;q=0.9",

//         "--concurrent-fragments", "2",
//         "--fragment-retries", "5",
//         "--http-chunk-size", "2097152",
//         "--buffer-size", "16384",

//         "--no-check-certificate",
//         "--no-part",
//         "--no-continue",
//         "--no-playlist",
//         "--retries", "8",
//         "--socket-timeout", "90",
//         "--sleep-interval", "3",
//         "--max-sleep-interval", "6",
//         "--progress",
//         "--newline",
//         url,
//       ];
//     } else if (detectedPlatform === 'instagram') {
//       ytdlpArgs = [
//         "-f", "best[ext=mp4]/best",
//         "-o", outputTemplate,

//         "--quiet",
//         "--no-warnings",

//         "--concurrent-fragments", "4",
//         "--fragment-retries", "3",
//         "--http-chunk-size", "5242880",
//         "--buffer-size", "32768",

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
//     } else if (detectedPlatform === 'youtube') {
//       const formatString = formatId && formatId !== "auto"
//         ? `${formatId}+bestaudio/${formatId}/best[height<=720]`
//         : "best[height<=720]/best";

//       ytdlpArgs = [
//         "-f", formatString,
//         "-o", outputTemplate,

//         "--quiet",
//         "--no-warnings",

//         "--concurrent-fragments", "6",
//         "--fragment-retries", "3",
//         "--http-chunk-size", "8388608",
//         "--buffer-size", "65536",

//         "--extractor-args", "youtube:player_client=web",
//         "--extractor-args", "youtube:skip=dash",

//         "--no-check-certificate",
//         "--no-part",
//         "--no-continue",
//         "--no-playlist",
//         "--retries", "5",
//         "--socket-timeout", "60",
//         "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         "--sleep-interval", "1",
//         "--max-sleep-interval", "2",

//         ...(formatString.includes("+bestaudio") ? ["--merge-output-format", "mp4"] : []),

//         "--progress",
//         "--newline",
//         url,
//       ];
//     } else {
//       ytdlpArgs = [
//         "-f", "best[height<=720]/best",
//         "-o", outputTemplate,

//         "--quiet",
//         "--no-warnings",

//         "--concurrent-fragments", "3",
//         "--fragment-retries", "2",
//         "--http-chunk-size", "3145728",
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

//     console.log("🔇 Starting SILENT download");

//     setImmediate(() => {
//       startSilentDownload(ytdlpArgs, downloadId, sanitizedPlatform, timestamp, detectedPlatform);
//     });

//     return NextResponse.json({
//       success: true,
//       downloadId: downloadId,
//       message: `${detectedPlatform} silent download started!`,
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
//   if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) return 'facebook';
//   return 'generic';
// }

// function startSilentDownload(args: string[], downloadId: string, platform: string, timestamp: number, detectedPlatform: string) {
//   console.log(`🔇 Starting SILENT ${detectedPlatform} download for:`, downloadId);

//   // 🔥 EXTENDED TIMEOUT FOR TIKTOK
//   const timeoutMs = detectedPlatform === 'tiktok' ? 180000 : 60000; // 3 minutes for TikTok, 1 minute for others

//   const ytdlp = spawn("yt-dlp", args, {
//     env: { ...process.env, PYTHONUNBUFFERED: '1' },
//     timeout: timeoutMs
//   });

//   let hasError = false;
//   const startTime = Date.now();

//   if (activeDownloads.has(downloadId)) {
//     activeDownloads.get(downloadId).progress.status = "downloading";
//     activeDownloads.get(downloadId).progress.message = `${detectedPlatform} downloading silently...`;
//   }

//   ytdlp.stdout.on("data", (data) => {
//     parseSilentProgress(data.toString(), downloadId);
//   });

//   ytdlp.stderr.on("data", (data) => {
//     const output = data.toString();

//     // 🚨 PLATFORM SPECIFIC ERROR HANDLING
//     if (detectedPlatform === 'tiktok' && (output.includes("timed out") || output.includes("Connection timeout"))) {
//       console.log("❌ TikTok connection timeout - anti-bot protection active");
//       updateProgressError(downloadId,
//         "TikTok download failed due to connection timeout. This is likely due to:\n" +
//         "• TikTok's anti-bot protection\n" +
//         "• Network connectivity issues\n" +
//         "• Regional blocking\n" +
//         "Try again in a few minutes or use a different TikTok URL.",
//         detectedPlatform
//       );
//       return;
//     }

//     if (detectedPlatform === 'facebook' && output.includes("Unsupported URL")) {
//       console.log("❌ Facebook URL not supported by yt-dlp");
//       updateProgressError(downloadId,
//         "Facebook URL format not supported. Use: facebook.com/watch?v=... or fb.watch/... URLs",
//         detectedPlatform
//       );
//       return;
//     }

//     // Only log actual ERRORS
//     if (output.includes("ERROR") &&
//         !output.includes("nsig") &&
//         !output.includes("WARNING") &&
//         !output.includes("Falling back")) {
//       console.log(`❌ ${detectedPlatform} ERROR:`, output.trim());
//     }

//     parseSilentProgress(output, downloadId);
//   });

//   ytdlp.on("close", (code) => {
//     currentActiveDownloads--;

//     const endTime = Date.now();
//     const duration = (endTime - startTime) / 1000;
//     console.log(`🏁 ${detectedPlatform} SILENT download finished: code ${code} | ${duration.toFixed(1)}s`);

//     if (code === 0 && !hasError) {
//       setTimeout(() => {
//         try {
//           const downloadsDir = path.join(process.cwd(), "public", "downloads");
//           const files = fs.readdirSync(downloadsDir);

//           const downloadedFile = files.find(file =>
//             file.includes(`${platform}_${timestamp}`) ||
//             (file.includes(platform) && (file.includes('.mp4') || file.includes('.webm')))
//           );

//           if (downloadedFile) {
//             const filePath = path.join(downloadsDir, downloadedFile);
//             const fileStats = fs.statSync(filePath);

//             if (fileStats.size > 1024) {
//               const sizeMB = fileStats.size / (1024 * 1024);
//               const speedMBps = duration > 0 ? sizeMB / duration : 0;

//               console.log(`✅ SILENT SUCCESS: ${downloadedFile} (${sizeMB.toFixed(1)}MB @ ${speedMBps.toFixed(1)}MB/s)`);

//               const download = activeDownloads.get(downloadId);
//               if (download) {
//                 download.progress = {
//                   ...download.progress,
//                   status: "completed",
//                   percentage: 100,
//                   filename: downloadedFile,
//                   fileSize: Math.round(sizeMB),
//                   message: `${detectedPlatform} completed silently! ${speedMBps.toFixed(1)} MB/s`,
//                 };
//               }
//             } else {
//               updateProgressError(downloadId, "File too small", detectedPlatform);
//             }
//           } else {
//             updateProgressError(downloadId, "File not found", detectedPlatform);
//           }
//         } catch (err) {
//           updateProgressError(downloadId, "File processing error", detectedPlatform);
//         }
//       }, 1500);
//     } else {
//       // Better error messages for specific platforms
//       if (detectedPlatform === 'tiktok') {
//         updateProgressError(downloadId,
//           `TikTok download failed. Common reasons:\n` +
//           `• Connection timeout (TikTok anti-bot protection)\n` +
//           `• Video may be private or deleted\n` +
//           `• Regional restrictions\n` +
//           `• Network connectivity issues\n\n` +
//           `Try: Different TikTok video or wait 5-10 minutes`,
//           detectedPlatform
//         );
//       } else if (detectedPlatform === 'facebook') {
//         updateProgressError(downloadId,
//           `Facebook download failed. Use supported URLs:\n` +
//           `✅ facebook.com/watch?v=...\n` +
//           `✅ fb.watch/...\n` +
//           `❌ facebook.com/share/...\n` +
//           `❌ facebook.com/reel/...`,
//           detectedPlatform
//         );
//       } else {
//         updateProgressError(downloadId, `Download failed (code: ${code})`, detectedPlatform);
//       }
//     }
//   });

//   ytdlp.on("error", (error) => {
//     hasError = true;
//     currentActiveDownloads--;
//     console.error(`💥 ${detectedPlatform} PROCESS ERROR:`, error.message);
//     updateProgressError(downloadId, `Process error: ${error.message}`, detectedPlatform);
//   });
// }

// function parseSilentProgress(output: string, downloadId: string) {
//   if (!activeDownloads.has(downloadId)) return;

//   const download = activeDownloads.get(downloadId);
//   const lines = output.split("\n");

//   for (const line of lines) {
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
//         message: `Silent download... ${percentage.toFixed(1)}%`,
//       };
//       return;
//     }

//     if (line.includes("[download] 100%") || line.includes("has already been downloaded")) {
//       download.progress = {
//         ...download.progress,
//         status: "processing",
//         percentage: 100,
//         message: "Finalizing silent download...",
//       };
//       return;
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
//       message: `${platform} silent download failed`,
//     };
//     console.error(`❌ ${platform} SILENT ERROR:`, error);
//   }
// }

// export { activeDownloads };

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

// import { NextRequest, NextResponse } from "next/server";
// import { spawn } from "child_process";
// import path from "path";
// import fs from "fs";

// // 🚀 HIGH PERFORMANCE SETTINGS for 10K downloads/day with IP ROTATION
// const MAX_CONCURRENT_DOWNLOADS = 200;
// const activeDownloads = new Map();
// let currentActiveDownloads = 0;

// // 🔄 ADVANCED IP ROTATION SYSTEM
// const ipSimulationData = new Map();
// const userAgentPool = [
//   // Windows Chrome
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",

//   // macOS Safari
//   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
//   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",

//   // Firefox
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
//   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0",

//   // Edge
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",

//   // Mobile
//   "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
//   "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
// ];

// const acceptLanguages = [
//   "en-US,en;q=0.9",
//   "en-US,en;q=0.8",
//   "en-GB,en;q=0.9",
//   "en-US,en;q=0.5",
//   "en-US,en;q=0.7",
// ];

// const screenResolutions = [
//   "1920x1080",
//   "1366x768",
//   "1536x864",
//   "1440x900",
//   "1280x1024",
//   "1600x900",
// ];

// // 🎯 IP SIMULATION CLASS
// class IPRotationManager {
//   constructor() {
//     this.currentSimulatedIP = this.generateSimulatedIP();
//     this.requestCount = 0;
//     this.lastRotation = Date.now();
//     this.rotationInterval = 45 * 60 * 1000; // 45 minutes per IP
//     this.maxRequestsPerIP = 8; // Max 8 YouTube requests per simulated IP
//   }

//   generateSimulatedIP(): string {
//     const segments = [];
//     for (let i = 0; i < 4; i++) {
//       segments.push(Math.floor(Math.random() * 256));
//     }
//     return segments.join(".");
//   }

//   shouldRotateIP(): boolean {
//     const now = Date.now();
//     const timeToRotate = now - this.lastRotation > this.rotationInterval;
//     const requestLimitReached = this.requestCount >= this.maxRequestsPerIP;

//     return timeToRotate || requestLimitReached;
//   }

//   rotateIP(): void {
//     this.currentSimulatedIP = this.generateSimulatedIP();
//     this.requestCount = 0;
//     this.lastRotation = Date.now();
//     console.log(`🔄 IP Rotated to: ${this.currentSimulatedIP}`);
//   }

//   recordRequest(): void {
//     this.requestCount++;
//     console.log(
//       `📊 Request ${this.requestCount}/${this.maxRequestsPerIP} for IP: ${this.currentSimulatedIP}`
//     );
//   }

//   getFingerprint(): object {
//     const hour = Math.floor(Date.now() / (1000 * 60 * 60));
//     const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

//     return {
//       userAgent: userAgentPool[(hour + day) % userAgentPool.length],
//       acceptLanguage: acceptLanguages[hour % acceptLanguages.length],
//       screenResolution: screenResolutions[day % screenResolutions.length],
//       timezone: this.getRandomTimezone(),
//       sessionId: this.generateSessionId(),
//     };
//   }

//   getRandomTimezone(): string {
//     const timezones = [
//       "America/New_York",
//       "America/Los_Angeles",
//       "Europe/London",
//       "Europe/Berlin",
//       "Asia/Tokyo",
//     ];
//     return timezones[Math.floor(Math.random() * timezones.length)];
//   }

//   generateSessionId(): string {
//     return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
//   }
// }

// // 🌐 GLOBAL IP ROTATION MANAGER
// const ipRotationManager = new IPRotationManager();

// // 🔥 ENHANCED RATE LIMITING & QUEUE MANAGEMENT with IP rotation
// const platformQueues = {
//   youtube: { active: 0, max: 3 }, // 🔥 VERY LOW for YouTube (IP protection)
//   instagram: { active: 0, max: 40 }, // Instagram works fine
//   facebook: { active: 0, max: 30 },
//   tiktok: { active: 0, max: 25 },
//   generic: { active: 0, max: 25 },
// };

// export async function POST(request: NextRequest) {
//   try {
//     const { url, platform, formatId } = await request.json();

//     if (!url) {
//       return NextResponse.json({ error: "URL is required" }, { status: 400 });
//     }

//     const detectedPlatform = detectPlatform(url);

//     // 🔄 SPECIAL YOUTUBE IP ROTATION CHECK
//     if (detectedPlatform === "youtube") {
//       if (ipRotationManager.shouldRotateIP()) {
//         ipRotationManager.rotateIP();

//         // Add delay after IP rotation for YouTube
//         await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second delay
//       }

//       ipRotationManager.recordRequest();
//     }

//     // 🚦 INTELLIGENT QUEUE MANAGEMENT
//     if (!canProcessDownload(detectedPlatform)) {
//       const waitTime = getEstimatedWaitTime(detectedPlatform);

//       if (detectedPlatform === "youtube") {
//         return NextResponse.json(
//           {
//             error: `YouTube rate limited. Our IP simulation system is protecting against blocks. Wait ${Math.ceil(
//               waitTime / 60
//             )} minutes.`,
//             waitTime: waitTime,
//             suggestion:
//               "Try Instagram, TikTok, or Facebook downloads - they work normally!",
//           },
//           { status: 503 }
//         );
//       }

//       return NextResponse.json(
//         {
//           error: "Server busy for this platform. Try again in 10-15 seconds.",
//           waitTime: waitTime,
//         },
//         { status: 503 }
//       );
//     }

//     // Update counters
//     currentActiveDownloads++;
//     platformQueues[detectedPlatform].active++;

//     const downloadId = generateOptimizedId();
//     console.log(
//       `🆔 Download ID: ${downloadId} (${currentActiveDownloads}/${MAX_CONCURRENT_DOWNLOADS}) [${detectedPlatform}]`
//     );

//     if (detectedPlatform === "youtube") {
//       console.log(
//         `🌐 YouTube IP: ${ipRotationManager.currentSimulatedIP} | Request: ${ipRotationManager.requestCount}`
//       );
//     }

//     const downloadsDir = path.join(process.cwd(), "public", "downloads");
//     if (!fs.existsSync(downloadsDir)) {
//       fs.mkdirSync(downloadsDir, { recursive: true });
//     }

//     const timestamp = Date.now();
//     const sanitizedPlatform = detectedPlatform.replace(/[^a-zA-Z0-9]/g, "");
//     const outputTemplate = path.join(
//       downloadsDir,
//       `${sanitizedPlatform}_${timestamp}_%(title).50s.%(ext)s`
//     );

//     activeDownloads.set(downloadId, {
//       progress: {
//         status: "initializing",
//         percentage: 0,
//         speed: null,
//         eta: null,
//         downloaded: "0MB",
//         totalSize: null,
//         filename: null,
//         message: `Initializing ${detectedPlatform} download...`,
//         platform: detectedPlatform,
//         startTime: Date.now(),
//         simulatedIP:
//           detectedPlatform === "youtube"
//             ? ipRotationManager.currentSimulatedIP
//             : null,
//       },
//     });

//     // 🔥 OPTIMIZED ARGS BUILDER with IP rotation
//     const ytdlpArgs = buildHighPerformanceArgs(
//       detectedPlatform,
//       url,
//       formatId,
//       outputTemplate
//     );

//     console.log(`🚀 Starting ${detectedPlatform} download with IP rotation`);

//     setImmediate(() => {
//       startOptimizedDownload(
//         ytdlpArgs,
//         downloadId,
//         sanitizedPlatform,
//         timestamp,
//         detectedPlatform
//       );
//     });

//     return NextResponse.json({
//       success: true,
//       downloadId: downloadId,
//       message: `${detectedPlatform} download queued successfully!`,
//       platform: detectedPlatform,
//       queuePosition: getQueuePosition(detectedPlatform),
//       ...(detectedPlatform === "youtube" && {
//         ipInfo: {
//           simulatedIP: ipRotationManager.currentSimulatedIP,
//           requestCount: ipRotationManager.requestCount,
//           maxRequests: ipRotationManager.maxRequestsPerIP,
//         },
//       }),
//     });
//   } catch (error: any) {
//     currentActiveDownloads--;
//     console.error("💥 Download error:", error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // 🎯 INTELLIGENT QUEUE CHECKER
// function canProcessDownload(platform: string): boolean {
//   if (currentActiveDownloads >= MAX_CONCURRENT_DOWNLOADS) return false;
//   if (platformQueues[platform].active >= platformQueues[platform].max)
//     return false;
//   return true;
// }

// function getEstimatedWaitTime(platform: string): number {
//   const queueSize =
//     platformQueues[platform].active - platformQueues[platform].max + 1;

//   if (platform === "youtube") {
//     // Longer waits for YouTube IP protection
//     return Math.max(queueSize * 120, 300); // 2 minutes per queue item, min 5 minutes
//   }

//   return Math.max(queueSize * 15, 10); // 15 seconds per queued item, min 10 seconds
// }

// function getQueuePosition(platform: string): number {
//   return Math.max(
//     platformQueues[platform].active - platformQueues[platform].max,
//     0
//   );
// }

// // 🔧 HIGH-PERFORMANCE ARGS BUILDER with IP ROTATION
// function buildHighPerformanceArgs(
//   platform: string,
//   url: string,
//   formatId: string,
//   outputTemplate: string
// ): string[] {
//   const baseArgs = [
//     "-o",
//     outputTemplate,
//     "--quiet",
//     "--no-warnings",
//     "--progress",
//     "--newline",
//     "--no-check-certificate",
//     "--no-part",
//     "--no-continue",
//     "--no-playlist",
//   ];

//   // 🚀 PLATFORM-OPTIMIZED CONFIGURATIONS
//   switch (platform) {
//     case "instagram":
//       return [
//         ...getInstagramOptimizedArgs(formatId),
//         ...baseArgs,
//         ...getInstagramHeaders(),
//         url,
//       ];
//     case "facebook":
//       return [
//         ...getFacebookOptimizedArgs(formatId),
//         ...baseArgs,
//         ...getFacebookHeaders(),
//         url,
//       ];
//     case "youtube":
//       return [
//         ...getYouTubeOptimizedArgsWithRotation(formatId),
//         ...baseArgs,
//         ...getYouTubeRotatedHeaders(),
//         url,
//       ];
//     case "tiktok":
//       return [
//         ...getTikTokOptimizedArgs(formatId),
//         ...baseArgs,
//         ...getTikTokHeaders(),
//         url,
//       ];
//     default:
//       return [
//         ...getGenericOptimizedArgs(formatId),
//         ...baseArgs,
//         "--user-agent",
//         getRandomUserAgent(),
//         url,
//       ];
//   }
// }

// // 🎬 YOUTUBE WITH ADVANCED IP ROTATION
// function getYouTubeOptimizedArgsWithRotation(formatId: string): string[] {
//   const formatString =
//     formatId && formatId !== "auto"
//       ? `${formatId}+bestaudio/${formatId}/best[height<=480]` // 🔥 480p max for higher success
//       : "best[height<=480]/best";

//   return [
//     "-f",
//     formatString,

//     // 🚀 ADVANCED YOUTUBE BYPASS with IP ROTATION (September 2025)
//     "--extractor-args",
//     "youtube:player_client=web_embedded,android_creator,ios_music,web",
//     "--extractor-args",
//     "youtube:player_skip=dash,hls,configs,webpage,initial_data",
//     "--extractor-args",
//     "youtube:skip=translated_subs,dash,hls,live_chat",
//     "--extractor-args",
//     "youtube:innertube_host=youtubei.googleapis.com",

//     // 🔥 ANTI-BOT & IP ROTATION PROTECTION
//     "--no-check-certificate",
//     "--no-call-home",
//     "--no-warnings",
//     "--ignore-errors",
//     "--no-abort-on-error",
//     "--ignore-config",

//     // 🎯 ULTRA-CONSERVATIVE PERFORMANCE (Mimic Human Behavior)
//     "--concurrent-fragments",
//     "1", // 🔥 SINGLE FRAGMENT (most human-like)
//     "--fragment-retries",
//     "20", // Many retries
//     "--http-chunk-size",
//     "1048576", // 1MB chunks (small)
//     "--buffer-size",
//     "8192", // 8KB buffer (conservative)

//     // 🕐 HUMAN-LIKE DELAYS (Critical for IP reputation)
//     "--retries",
//     "25", // Maximum retries
//     "--socket-timeout",
//     "600", // 10 minutes timeout
//     "--sleep-interval",
//     "12", // 12 seconds sleep (very human-like)
//     "--max-sleep-interval",
//     "30", // Max 30 seconds sleep

//     // 🔄 RESUME & ERROR HANDLING
//     "--continue", // Resume broken downloads
//     "--no-overwrites", // Don't overwrite
//     "--no-mtime", // Don't preserve modification time

//     ...(formatString.includes("+bestaudio")
//       ? ["--merge-output-format", "mp4"]
//       : []),
//   ];
// }

// function getYouTubeRotatedHeaders(): string[] {
//   const fingerprint = ipRotationManager.getFingerprint();

//   // 🔄 DYNAMIC HEADERS BASED on IP ROTATION
//   const baseHeaders = [
//     "--user-agent",
//     fingerprint.userAgent,
//     "--add-header",
//     `Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8`,
//     "--add-header",
//     `Accept-Language:${fingerprint.acceptLanguage}`,
//     "--add-header",
//     "Accept-Encoding:gzip, deflate, br",
//     "--add-header",
//     "DNT:1",
//     "--add-header",
//     "Connection:keep-alive",
//     "--add-header",
//     "Upgrade-Insecure-Requests:1",
//     "--add-header",
//     "Cache-Control:no-cache",
//     "--add-header",
//     "Pragma:no-cache",
//   ];

//   // 🎯 ADVANCED ANTI-FINGERPRINTING HEADERS
//   const advancedHeaders = [
//     "--add-header",
//     "Sec-Fetch-Dest:document",
//     "--add-header",
//     "Sec-Fetch-Mode:navigate",
//     "--add-header",
//     "Sec-Fetch-Site:none",
//     "--add-header",
//     "Sec-Fetch-User:?1",
//     "--add-header",
//     `Sec-CH-UA:'Chromium';v='120', 'Not A(Brand';v='99', 'Google Chrome';v='120'`,
//     "--add-header",
//     "Sec-CH-UA-Mobile:?0",
//     "--add-header",
//     "Sec-CH-UA-Platform:'Windows'",
//     "--add-header",
//     `X-Forwarded-For:${ipRotationManager.currentSimulatedIP}`,
//     "--add-header",
//     `CF-Connecting-IP:${ipRotationManager.currentSimulatedIP}`,
//     "--add-header",
//     `X-Real-IP:${ipRotationManager.currentSimulatedIP}`,
//   ];

//   return [...baseHeaders, ...advancedHeaders];
// }

// // 🎬 INSTAGRAM OPTIMIZATIONS (Working fine)
// function getInstagramOptimizedArgs(formatId: string): string[] {
//   return [
//     "-f",
//     formatId && formatId !== "auto" ? formatId : "best[height<=1080]/best",
//     "--concurrent-fragments",
//     "6",
//     "--fragment-retries",
//     "5",
//     "--http-chunk-size",
//     "8388608",
//     "--buffer-size",
//     "65536",
//     "--retries",
//     "8",
//     "--socket-timeout",
//     "60",
//     "--sleep-interval",
//     "2",
//     "--max-sleep-interval",
//     "5",
//   ];
// }

// function getInstagramHeaders(): string[] {
//   return [
//     "--user-agent",
//     "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
//     "--add-header",
//     "X-Instagram-AJAX:1",
//     "--add-header",
//     "X-Requested-With:XMLHttpRequest",
//     "--add-header",
//     "Accept:*/*",
//     "--add-header",
//     "Accept-Language:en-US,en;q=0.9",
//     "--add-header",
//     "Sec-Fetch-Dest:empty",
//     "--add-header",
//     "Sec-Fetch-Mode:cors",
//     "--add-header",
//     "Sec-Fetch-Site:same-origin",
//   ];
// }

// // 🎬 FACEBOOK OPTIMIZATIONS
// function getFacebookOptimizedArgs(formatId: string): string[] {
//   return [
//     "-f",
//     formatId && formatId !== "auto" ? formatId : "best[height<=720]/best",
//     "--concurrent-fragments",
//     "4",
//     "--fragment-retries",
//     "8",
//     "--http-chunk-size",
//     "5242880",
//     "--buffer-size",
//     "32768",
//     "--retries",
//     "10",
//     "--socket-timeout",
//     "90",
//     "--sleep-interval",
//     "3",
//     "--max-sleep-interval",
//     "8",
//   ];
// }

// function getFacebookHeaders(): string[] {
//   return [
//     "--user-agent",
//     "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
//     "--add-header",
//     "Accept-Language:en-US,en;q=0.9",
//     "--add-header",
//     "Referer:https://www.facebook.com/",
//     "--add-header",
//     "Sec-Fetch-Dest:video",
//     "--add-header",
//     "Sec-Fetch-Mode:no-cors",
//     "--add-header",
//     "Sec-Fetch-Site:cross-site",
//   ];
// }

// // 🎬 TIKTOK OPTIMIZATIONS
// function getTikTokOptimizedArgs(formatId: string): string[] {
//   return [
//     "-f",
//     formatId && formatId !== "auto" ? formatId : "best[height<=720]/best",
//     "--concurrent-fragments",
//     "3",
//     "--fragment-retries",
//     "10",
//     "--http-chunk-size",
//     "2097152",
//     "--buffer-size",
//     "16384",
//     "--retries",
//     "12",
//     "--socket-timeout",
//     "120",
//     "--sleep-interval",
//     "4",
//     "--max-sleep-interval",
//     "10",
//   ];
// }

// function getTikTokHeaders(): string[] {
//   return [
//     "--user-agent",
//     "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
//     "--add-header",
//     "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
//     "--add-header",
//     "Accept-Language:en-US,en;q=0.9",
//     "--add-header",
//     "Accept-Encoding:gzip, deflate",
//     "--add-header",
//     "DNT:1",
//     "--add-header",
//     "Connection:keep-alive",
//     "--add-header",
//     "Upgrade-Insecure-Requests:1",
//     "--geo-bypass",
//   ];
// }

// // 🎬 GENERIC OPTIMIZATIONS
// function getGenericOptimizedArgs(formatId: string): string[] {
//   return [
//     "-f",
//     formatId && formatId !== "auto" ? formatId : "best[height<=720]/best",
//     "--concurrent-fragments",
//     "5",
//     "--fragment-retries",
//     "4",
//     "--http-chunk-size",
//     "5242880",
//     "--buffer-size",
//     "32768",
//     "--retries",
//     "5",
//     "--socket-timeout",
//     "45",
//   ];
// }

// // 🚀 OPTIMIZED DOWNLOAD STARTER with IP rotation
// function startOptimizedDownload(
//   args: string[],
//   downloadId: string,
//   platform: string,
//   timestamp: number,
//   detectedPlatform: string
// ) {
//   console.log(`🚀 Starting ${detectedPlatform} download: ${downloadId}`);

//   if (detectedPlatform === "youtube") {
//     console.log(
//       `🌐 Using simulated IP: ${ipRotationManager.currentSimulatedIP}`
//     );
//   }

//   const timeoutMs = getOptimalTimeout(detectedPlatform);
//   const ytdlp = spawn("yt-dlp", args, {
//     env: { ...process.env, PYTHONUNBUFFERED: "1" },
//     timeout: timeoutMs,
//   });

//   let hasError = false;
//   let lastProgressTime = Date.now();
//   const startTime = Date.now();

//   if (activeDownloads.has(downloadId)) {
//     activeDownloads.get(downloadId).progress.status = "downloading";
//     activeDownloads.get(
//       downloadId
//     ).progress.message = `${detectedPlatform} downloading with IP rotation...`;
//   }

//   ytdlp.stdout.on("data", (data) => {
//     parseOptimizedProgress(data.toString(), downloadId, detectedPlatform);
//     lastProgressTime = Date.now();
//   });

//   ytdlp.stderr.on("data", (data) => {
//     const output = data.toString();
//     handlePlatformErrors(output, downloadId, detectedPlatform);
//   });

//   ytdlp.on("close", (code) => {
//     const endTime = Date.now();
//     const duration = (endTime - startTime) / 1000;

//     // Update counters
//     currentActiveDownloads--;
//     platformQueues[detectedPlatform].active--;

//     console.log(
//       `🏁 ${detectedPlatform} download finished: ${downloadId} | ${duration.toFixed(
//         1
//       )}s | Code: ${code}`
//     );

//     if (detectedPlatform === "youtube") {
//       console.log(
//         `🌐 IP ${
//           ipRotationManager.currentSimulatedIP
//         } | Duration: ${duration.toFixed(1)}s | Success: ${code === 0}`
//       );
//     }

//     if (code === 0 && !hasError) {
//       processSuccessfulDownload(
//         downloadId,
//         platform,
//         timestamp,
//         duration,
//         detectedPlatform
//       );
//     } else {
//       handleDownloadFailure(downloadId, detectedPlatform, code, duration);
//     }
//   });

//   ytdlp.on("error", (error) => {
//     hasError = true;
//     currentActiveDownloads--;
//     platformQueues[detectedPlatform].active--;
//     console.error(`💥 ${detectedPlatform} process error:`, error.message);
//     updateProgressError(
//       downloadId,
//       `Process error: ${error.message}`,
//       detectedPlatform
//     );
//   });

//   // 🔥 PROGRESS TIMEOUT CHECKER
//   const progressChecker = setInterval(() => {
//     if (Date.now() - lastProgressTime > 300000) {
//       // 5 minutes no progress for YouTube
//       console.log(`⏰ ${detectedPlatform} progress timeout: ${downloadId}`);
//       ytdlp.kill();
//       clearInterval(progressChecker);
//     }
//   }, 30000);

//   ytdlp.on("close", () => {
//     clearInterval(progressChecker);
//   });
// }

// function getOptimalTimeout(platform: string): number {
//   switch (platform) {
//     case "youtube":
//       return 900000; // 15 minutes for YouTube (IP rotation needs time)
//     case "tiktok":
//       return 240000; // 4 minutes
//     case "facebook":
//       return 180000; // 3 minutes
//     case "instagram":
//       return 120000; // 2 minutes
//     default:
//       return 120000; // 2 minutes
//   }
// }

// // 🔧 OPTIMIZED PROGRESS PARSER (Fixed)
// function parseOptimizedProgress(
//   output: string,
//   downloadId: string,
//   platform: string
// ) {
//   if (!activeDownloads.has(downloadId)) return;

//   const download = activeDownloads.get(downloadId);
//   const lines = output.split("\n");

//   for (const line of lines) {
//     // Enhanced progress parsing with multiple patterns
//     let progressMatch = line.match(
//       /\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)(?:\s+ETA\s+(\d{2}:\d{2}))?/
//     );

//     if (!progressMatch) {
//       progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%/);
//     }

//     if (!progressMatch) {
//       progressMatch = line.match(
//         /(\d{1,3}(?:\.\d+)?)%.*of.*(\d+(?:\.\d+)?\s*[KMGT]?B)/
//       );
//     }

//     if (progressMatch) {
//       const percentage = parseFloat(progressMatch[1]);
//       const totalSize = progressMatch[2] || null;
//       const speed = progressMatch[3] || null;
//       const eta = progressMatch[4] || null;

//       download.progress = {
//         ...download.progress,
//         status: "downloading",
//         percentage: Math.min(Math.max(percentage, 0), 100),
//         speed: speed ? formatSpeed(speed) : null,
//         eta: eta,
//         totalSize: totalSize ? formatSize(totalSize) : null,
//         message: `${platform} downloading... ${percentage.toFixed(1)}% ${
//           speed ? "@ " + formatSpeed(speed) : ""
//         }`,
//         lastUpdate: Date.now(),
//       };
//       return;
//     }

//     if (
//       line.includes("[download] 100%") ||
//       line.includes("has already been downloaded") ||
//       line.includes("download completed")
//     ) {
//       console.log(`🎯 ${platform} download completion detected`);
//       download.progress = {
//         ...download.progress,
//         status: "processing",
//         percentage: 100,
//         message: `${platform} finalizing download...`,
//       };
//       return;
//     }
//   }
// }

// // 🎉 SUCCESS PROCESSOR (Fixed endTime error)
// function processSuccessfulDownload(
//   downloadId: string,
//   platform: string,
//   timestamp: number,
//   duration: number,
//   detectedPlatform: string
// ) {
//   setTimeout(() => {
//     try {
//       const downloadsDir = path.join(process.cwd(), "public", "downloads");

//       if (!fs.existsSync(downloadsDir)) {
//         console.log("❌ Downloads directory not found");
//         updateProgressError(
//           downloadId,
//           "Downloads directory not found",
//           detectedPlatform
//         );
//         return;
//       }

//       const files = fs.readdirSync(downloadsDir);
//       console.log(
//         `🔍 Looking for files with platform: ${platform}, timestamp: ${timestamp}`
//       );
//       console.log(`📁 Total files in directory: ${files.length}`);
//       console.log(`📂 Recent files:`, files.slice(-10)); // Show last 10 files

//       // 🔥 ENHANCED FILE DETECTION (Multiple strategies)
//       let downloadedFile = null;

//       // Strategy 1: Exact timestamp match
//       downloadedFile = files.find((file) =>
//         file.includes(`${platform}_${timestamp}`)
//       );
//       console.log(
//         `🎯 Strategy 1 (exact timestamp): ${downloadedFile || "Not found"}`
//       );

//       // Strategy 2: Platform match with recent timestamp (within 2 minutes)
//       if (!downloadedFile) {
//         const currentTime = Date.now();
//         const timeWindow = 2 * 60 * 1000; // 2 minutes

//         downloadedFile = files.find((file) => {
//           if (file.includes(platform)) {
//             try {
//               const filePath = path.join(downloadsDir, file);
//               const stats = fs.statSync(filePath);
//               const isRecent = currentTime - stats.mtimeMs < timeWindow;
//               console.log(
//                 `📅 File: ${file} | Age: ${(
//                   (currentTime - stats.mtimeMs) /
//                   1000
//                 ).toFixed(1)}s | Recent: ${isRecent}`
//               );
//               return isRecent;
//             } catch (error) {
//               return false;
//             }
//           }
//           return false;
//         });
//         console.log(
//           `🎯 Strategy 2 (recent platform files): ${
//             downloadedFile || "Not found"
//           }`
//         );
//       }

//       // Strategy 3: Any recent video file (last 90 seconds)
//       if (!downloadedFile) {
//         const videoExtensions = [
//           ".mp4",
//           ".webm",
//           ".mkv",
//           ".m4a",
//           ".avi",
//           ".mov",
//         ];
//         const currentTime = Date.now();
//         const shortTimeWindow = 90 * 1000; // 90 seconds

//         downloadedFile = files.find((file) => {
//           const hasVideoExt = videoExtensions.some((ext) =>
//             file.toLowerCase().endsWith(ext)
//           );
//           if (hasVideoExt) {
//             try {
//               const filePath = path.join(downloadsDir, file);
//               const stats = fs.statSync(filePath);
//               const isVeryRecent =
//                 currentTime - stats.mtimeMs < shortTimeWindow;
//               console.log(
//                 `🎬 Video file: ${file} | Age: ${(
//                   (currentTime - stats.mtimeMs) /
//                   1000
//                 ).toFixed(1)}s | Very recent: ${isVeryRecent}`
//               );
//               return isVeryRecent;
//             } catch (error) {
//               return false;
//             }
//           }
//           return false;
//         });
//         console.log(
//           `🎯 Strategy 3 (recent video files): ${downloadedFile || "Not found"}`
//         );
//       }

//       // Strategy 4: Largest recent file (fallback)
//       if (!downloadedFile) {
//         const currentTime = Date.now();
//         const recentFiles = files
//           .map((file) => {
//             try {
//               const filePath = path.join(downloadsDir, file);
//               const stats = fs.statSync(filePath);
//               return {
//                 name: file,
//                 size: stats.size,
//                 mtime: stats.mtimeMs,
//                 age: currentTime - stats.mtimeMs,
//               };
//             } catch (error) {
//               return null;
//             }
//           })
//           .filter((file) => file && file.age < 120000 && file.size > 10240) // 2 minutes, >10KB
//           .sort((a, b) => b.size - a.size); // Largest first

//         if (recentFiles.length > 0) {
//           downloadedFile = recentFiles[0].name;
//           console.log(
//             `🎯 Strategy 4 (largest recent): ${downloadedFile} (${(
//               recentFiles[0].size /
//               1024 /
//               1024
//             ).toFixed(1)}MB)`
//           );
//         }
//       }

//       if (downloadedFile) {
//         const filePath = path.join(downloadsDir, downloadedFile);

//         try {
//           const fileStats = fs.statSync(filePath);

//           if (fileStats.size > 1024) {
//             // At least 1KB
//             const sizeMB = fileStats.size / (1024 * 1024);
//             const speedMBps = duration > 0 ? sizeMB / duration : 0;

//             console.log(`✅ FILE FOUND & VERIFIED: ${downloadedFile}`);
//             console.log(
//               `📊 Size: ${sizeMB.toFixed(1)}MB | Speed: ${speedMBps.toFixed(
//                 1
//               )}MB/s | Duration: ${duration.toFixed(1)}s`
//             );

//             const download = activeDownloads.get(downloadId);
//             if (download) {
//               download.progress = {
//                 ...download.progress,
//                 status: "completed",
//                 percentage: 100,
//                 filename: downloadedFile,
//                 fileSize: Math.round(sizeMB),
//                 actualSpeed: speedMBps.toFixed(1),
//                 message: `${detectedPlatform} completed successfully! File: ${downloadedFile}`,
//                 completedAt: Date.now(),
//                 downloadUrl: `/api/download-file?filename=${encodeURIComponent(
//                   downloadedFile
//                 )}`,
//               };

//               console.log(
//                 `🎉 DOWNLOAD MARKED AS SUCCESSFUL: ${downloadId} → ${downloadedFile}`
//               );
//               console.log(
//                 `🔗 Download URL: /api/download-file?filename=${encodeURIComponent(
//                   downloadedFile
//                 )}`
//               );
//             }
//           } else {
//             console.log(
//               `⚠️ File too small: ${downloadedFile} (${fileStats.size} bytes)`
//             );
//             updateProgressError(
//               downloadId,
//               `File too small: ${downloadedFile} (${fileStats.size} bytes)`,
//               detectedPlatform
//             );
//           }
//         } catch (statError) {
//           console.error(
//             `❌ Error reading file stats for ${downloadedFile}:`,
//             statError
//           );
//           updateProgressError(
//             downloadId,
//             `Error accessing file: ${downloadedFile}`,
//             detectedPlatform
//           );
//         }
//       } else {
//         console.log(`❌ NO FILE FOUND for ${platform}_${timestamp}`);
//         console.log(`📋 All files in directory:`, files);
//         console.log(`🕐 Looking for files modified in last 2 minutes...`);

//         // Debug: Show all recent files with timestamps
//         const currentTime = Date.now();
//         files.forEach((file) => {
//           try {
//             const filePath = path.join(downloadsDir, file);
//             const stats = fs.statSync(filePath);
//             const ageMinutes = (currentTime - stats.mtimeMs) / (1000 * 60);
//             if (ageMinutes < 10) {
//               // Show files from last 10 minutes
//               console.log(
//                 `🕐 Recent file: ${file} | Age: ${ageMinutes.toFixed(
//                   1
//                 )} min | Size: ${(stats.size / 1024).toFixed(0)}KB`
//               );
//             }
//           } catch (error) {
//             // Skip problematic files
//           }
//         });

//         updateProgressError(
//           downloadId,
//           `File not found after successful download. Check downloads folder manually. Looking for: ${platform}_${timestamp}`,
//           detectedPlatform
//         );
//       }
//     } catch (err) {
//       console.error("💥 File processing error:", err);
//       updateProgressError(
//         downloadId,
//         `File processing failed: ${err.message}`,
//         detectedPlatform
//       );
//     }
//   }, 4000); // Wait 4 seconds for file to be fully written
// }

// // 🎯 PLATFORM-SPECIFIC ERROR HANDLER
// function handlePlatformErrors(
//   output: string,
//   downloadId: string,
//   platform: string
// ) {
//   if (output.includes("ERROR")) {
//     const error = extractErrorMessage(output, platform);
//     if (error) {
//       updateProgressError(downloadId, error, platform);
//     }
//   }
// }

// function extractErrorMessage(output: string, platform: string): string | null {
//   switch (platform) {
//     case "youtube":
//       if (output.includes("Sign in to confirm") || output.includes("bot")) {
//         return `YouTube anti-bot detected. IP: ${ipRotationManager.currentSimulatedIP} may be flagged. Rotating IP and waiting...`;
//       }
//       if (output.includes("HTTP Error 403") || output.includes("Forbidden")) {
//         return `YouTube blocked request. IP rotation in progress. Try again in 30 minutes.`;
//       }
//       break;
//     case "tiktok":
//       if (output.includes("timed out")) {
//         return "TikTok connection timeout. Try again in 5-10 minutes.";
//       }
//       break;
//     case "facebook":
//       if (output.includes("Unsupported URL")) {
//         return "Facebook URL not supported. Use facebook.com/watch?v=... or fb.watch/... formats.";
//       }
//       break;
//     case "instagram":
//       if (output.includes("login")) {
//         return "Instagram reel may be private. Try a different public reel.";
//       }
//       break;
//   }
//   return null;
// }

// function handleDownloadFailure(
//   downloadId: string,
//   platform: string,
//   code: number,
//   duration: number
// ) {
//   let message = "";

//   if (platform === "youtube") {
//     if (code === 1 && duration < 15) {
//       message = `YouTube IP Block Detected!

// 🌐 Current Simulated IP: ${ipRotationManager.currentSimulatedIP}
// ⏰ Duration: ${duration.toFixed(1)}s (too fast = instant block)
// 📊 Request Count: ${ipRotationManager.requestCount}/${
//         ipRotationManager.maxRequestsPerIP
//       }

// 🔄 AUTOMATIC ACTIONS:
// • IP will rotate automatically after ${
//         ipRotationManager.maxRequestsPerIP - ipRotationManager.requestCount
//       } more attempts
// • Next rotation in: ${Math.ceil(
//         (ipRotationManager.rotationInterval -
//           (Date.now() - ipRotationManager.lastRotation)) /
//           60000
//       )} minutes

// 💡 RECOMMENDATIONS:
// 1. Wait 30-60 minutes before trying YouTube again
// 2. Try different YouTube video URLs
// 3. Use Instagram/TikTok (working normally)
// 4. Consider VPN if problem persists

// ✅ OTHER PLATFORMS: Instagram, TikTok, Facebook working normally!`;
//     } else {
//       message = `YouTube download failed after ${duration.toFixed(1)}s.

// IP: ${ipRotationManager.currentSimulatedIP}
// Possible causes: Age-restricted, private, or regionally blocked video.`;
//     }
//   } else {
//     message = `${platform} download failed (Code: ${code}) after ${duration.toFixed(
//       1
//     )}s`;
//   }

//   updateProgressError(downloadId, message, platform);
// }

// function updateProgressError(
//   downloadId: string,
//   error: string,
//   platform: string
// ) {
//   if (activeDownloads.has(downloadId)) {
//     const download = activeDownloads.get(downloadId);
//     download.progress = {
//       ...download.progress,
//       status: "error",
//       error: error,
//       message: `${platform} download failed`,
//       failedAt: Date.now(),
//     };
//     console.error(`❌ ${platform} ERROR (${downloadId}):`, error);
//   }
// }

// // 🔧 HELPER FUNCTIONS
// function detectPlatform(url: string): string {
//   const cleanUrl = url.toLowerCase();
//   if (cleanUrl.includes("instagram.com")) return "instagram";
//   if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be"))
//     return "youtube";
//   if (cleanUrl.includes("tiktok.com")) return "tiktok";
//   if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.watch"))
//     return "facebook";
//   return "generic";
// }

// function generateOptimizedId(): string {
//   return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
// }

// function getRandomUserAgent(): string {
//   return userAgentPool[Math.floor(Math.random() * userAgentPool.length)];
// }

// function formatSpeed(speed: string): string {
//   return speed.replace("iB", "B");
// }

// function formatSize(size: string): string {
//   return size.replace("iB", "B");
// }

// export { activeDownloads };

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

// 🚀 HIGH PERFORMANCE SETTINGS with UNIVERSAL IP ROTATION
const MAX_CONCURRENT_DOWNLOADS = 200;
const activeDownloads = new Map();
let currentActiveDownloads = 0;

// 🌐 ENHANCED IP ROTATION FOR ALL PLATFORMS
class UniversalIPRotationManager {
  constructor() {
    this.ipPools = {
      // 🎬 YOUTUBE SPECIFIC PROXIES (High Success Rate)
      youtube: [
        "197.39.58.214",
        "3.58.167.48",
        "182.106.71.140",
        "185.162.231.106",
        "198.59.191.234",
        "103.207.8.130",
        "45.195.67.75",
        "103.216.207.15",
        "178.128.51.12",
        "103.52.211.194",
      ],

      // 📸 INSTAGRAM SPECIFIC PROXIES
      instagram: [
        "103.174.179.31",
        "202.61.51.204",
        "41.65.174.120",
        "103.127.1.130",
        "185.162.231.106",
        "198.59.191.234",
        "45.195.67.75",
        "103.216.207.15",
        "178.128.51.12",
        "194.67.91.153",
      ],

      // 📘 FACEBOOK SPECIFIC PROXIES
      facebook: [
        "103.245.204.214",
        "202.169.229.139",
        "103.145.133.22",
        "194.67.91.153",
        "185.162.231.106",
        "103.174.179.31",
        "198.59.191.234",
        "41.65.174.120",
        "103.127.1.130",
        "45.195.67.75",
      ],

      // 🎵 TIKTOK SPECIFIC PROXIES
      tiktok: [
        "178.128.51.12",
        "103.52.211.194",
        "194.67.91.153",
        "103.207.8.130",
        "185.162.231.106",
        "202.61.51.204",
        "41.65.174.120",
        "103.127.1.130",
        "103.216.207.15",
        "198.59.191.234",
      ],

      // 🌐 GENERIC PROXIES
      generic: [
        "103.174.179.31",
        "202.61.51.204",
        "41.65.174.120",
        "103.127.1.130",
        "185.162.231.106",
        "198.59.191.234",
        "45.195.67.75",
        "103.216.207.15",
        "178.128.51.12",
        "103.52.211.194",
      ],
    };

    this.currentIndexes = {
      youtube: 0,
      instagram: 0,
      facebook: 0,
      tiktok: 0,
      generic: 0,
    };

    this.requestCounts = {
      youtube: 0,
      instagram: 0,
      facebook: 0,
      tiktok: 0,
      generic: 0,
    };

    this.lastRotations = {
      youtube: Date.now(),
      instagram: Date.now(),
      facebook: Date.now(),
      tiktok: Date.now(),
      generic: Date.now(),
    };

    this.maxRequestsPerIP = {
      youtube: 8, // Conservative for YouTube
      instagram: 12, // Moderate for Instagram
      facebook: 10, // Moderate for Facebook
      tiktok: 6, // Very conservative for TikTok
      generic: 15, // Liberal for generic
    };

    this.rotationIntervals = {
      youtube: 45 * 60 * 1000, // 45 minutes
      instagram: 30 * 60 * 1000, // 30 minutes
      facebook: 35 * 60 * 1000, // 35 minutes
      tiktok: 25 * 60 * 1000, // 25 minutes
      generic: 40 * 60 * 1000, // 40 minutes
    };

    this.failedIPs = {
      youtube: new Set(),
      instagram: new Set(),
      facebook: new Set(),
      tiktok: new Set(),
      generic: new Set(),
    };

    console.log(
      "🌐 Universal IP Rotation Manager initialized for all platforms"
    );
  }

  getCurrentIP(platform: string): string {
    const pool = this.ipPools[platform] || this.ipPools.generic;
    const failedSet = this.failedIPs[platform] || this.failedIPs.generic;

    // Filter out failed IPs
    const workingIPs = pool.filter((ip) => !failedSet.has(ip));

    if (workingIPs.length === 0) {
      console.log(`🔄 All ${platform} IPs failed, resetting...`);
      failedSet.clear();
      this.currentIndexes[platform] = 0;
      return pool[0];
    }

    // Round-robin selection
    const currentIndex = this.currentIndexes[platform] % workingIPs.length;
    const selectedIP = workingIPs[currentIndex];

    this.currentIndexes[platform]++;

    return selectedIP;
  }

  shouldRotateIP(platform: string): boolean {
    const now = Date.now();
    const timeSinceRotation = now - this.lastRotations[platform];
    const requestCount = this.requestCounts[platform];
    const maxRequests = this.maxRequestsPerIP[platform];
    const rotationInterval = this.rotationIntervals[platform];

    return timeSinceRotation > rotationInterval || requestCount >= maxRequests;
  }

  rotateIP(platform: string): void {
    this.requestCounts[platform] = 0;
    this.lastRotations[platform] = Date.now();
    this.currentIndexes[platform] =
      (this.currentIndexes[platform] + 1) % this.ipPools[platform].length;

    const newIP = this.getCurrentIP(platform);
    console.log(`🔄 ${platform.toUpperCase()} IP rotated to: ${newIP}`);
  }

  recordRequest(platform: string): void {
    this.requestCounts[platform]++;
    const currentIP = this.getCurrentIP(platform);
    console.log(
      `📊 ${platform.toUpperCase()} Request ${this.requestCounts[platform]}/${
        this.maxRequestsPerIP[platform]
      } for IP: ${currentIP}`
    );
  }

  recordIPFailure(platform: string, ip: string): void {
    if (ip && this.failedIPs[platform]) {
      this.failedIPs[platform].add(ip);
      console.log(`❌ Marked ${platform} IP as failed: ${ip}`);
    }
  }

  recordIPSuccess(platform: string, ip: string): void {
    if (ip && this.failedIPs[platform] && this.failedIPs[platform].has(ip)) {
      this.failedIPs[platform].delete(ip);
      console.log(`✅ ${platform} IP recovered: ${ip}`);
    }
  }

  getStats(platform: string): object {
    return {
      currentIP: this.getCurrentIP(platform),
      requestCount: this.requestCounts[platform],
      maxRequests: this.maxRequestsPerIP[platform],
      failedIPs: this.failedIPs[platform].size,
      totalIPs: this.ipPools[platform].length,
      workingIPs: this.ipPools[platform].length - this.failedIPs[platform].size,
    };
  }
}

// 🌐 GLOBAL IP ROTATION MANAGER FOR ALL PLATFORMS
const universalIPManager = new UniversalIPRotationManager();

// 🔥 ENHANCED RATE LIMITING with IP PROTECTION
const platformQueues = {
  youtube: { active: 0, max: 5 }, // Conservative
  instagram: { active: 0, max: 8 }, // 🔥 Increased with IP rotation
  facebook: { active: 0, max: 6 }, // 🔥 Increased with IP rotation
  tiktok: { active: 0, max: 4 }, // 🔥 Increased with IP rotation
  generic: { active: 0, max: 10 }, // 🔥 Increased with IP rotation
};

export async function POST(request: NextRequest) {
  try {
    const { url, platform, formatId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const detectedPlatform = detectPlatform(url);

    // 🔄 UNIVERSAL IP ROTATION CHECK (ALL PLATFORMS)
    if (universalIPManager.shouldRotateIP(detectedPlatform)) {
      universalIPManager.rotateIP(detectedPlatform);

      // Platform-specific delays after rotation
      const rotationDelays = {
        youtube: 5000, // 5 seconds
        instagram: 3000, // 3 seconds
        facebook: 4000, // 4 seconds
        tiktok: 6000, // 6 seconds (most sensitive)
        generic: 2000, // 2 seconds
      };

      const delay = rotationDelays[detectedPlatform] || 3000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    universalIPManager.recordRequest(detectedPlatform);

    // 🚦 ENHANCED QUEUE MANAGEMENT
    if (!canProcessDownload(detectedPlatform)) {
      const waitTime = getEstimatedWaitTime(detectedPlatform);
      const stats = universalIPManager.getStats(detectedPlatform);

      return NextResponse.json(
        {
          error: `${detectedPlatform.toUpperCase()} busy. Wait ${Math.ceil(
            waitTime / 60
          )} minutes.`,
          waitTime: waitTime,
          ipStats: stats,
          suggestion: `Try again in few minutes. ${stats.workingIPs}/${stats.totalIPs} IPs available.`,
        },
        { status: 503 }
      );
    }

    // Update counters
    currentActiveDownloads++;
    platformQueues[detectedPlatform].active++;

    const downloadId = generateOptimizedId();
    const currentIP = universalIPManager.getCurrentIP(detectedPlatform);

    console.log(
      `🆔 Download ID: ${downloadId} (${currentActiveDownloads}/${MAX_CONCURRENT_DOWNLOADS}) [${detectedPlatform}]`
    );
    console.log(
      `🌐 ${detectedPlatform.toUpperCase()} IP: ${currentIP} | Request: ${
        universalIPManager.requestCounts[detectedPlatform]
      }`
    );

    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedPlatform = detectedPlatform.replace(/[^a-zA-Z0-9]/g, "");
    const outputTemplate = path.join(
      downloadsDir,
      `${sanitizedPlatform}_${timestamp}_%(title).50s.%(ext)s`
    );

    activeDownloads.set(downloadId, {
      progress: {
        status: "initializing",
        percentage: 0,
        speed: null,
        eta: null,
        downloaded: "0MB",
        totalSize: null,
        filename: null,
        message: `Initializing ${detectedPlatform} download with IP rotation...`,
        platform: detectedPlatform,
        startTime: Date.now(),
        simulatedIP: currentIP,
        retryCount: 0,
      },
    });

    // 🔥 BUILD ARGS with UNIVERSAL IP ROTATION
    const ytdlpArgs = buildUniversalIPArgs(
      detectedPlatform,
      url,
      formatId,
      outputTemplate
    );

    console.log(`🚀 Starting ${detectedPlatform} download with IP rotation`);

    setImmediate(() => {
      startUniversalIPDownload(
        ytdlpArgs,
        downloadId,
        sanitizedPlatform,
        timestamp,
        detectedPlatform,
        currentIP
      );
    });

    return NextResponse.json({
      success: true,
      downloadId: downloadId,
      message: `${detectedPlatform} download started with IP rotation!`,
      platform: detectedPlatform,
      ipInfo: universalIPManager.getStats(detectedPlatform),
    });
  } catch (error: any) {
    currentActiveDownloads--;
    console.error("💥 Download error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 🎯 QUEUE FUNCTIONS
function canProcessDownload(platform: string): boolean {
  if (currentActiveDownloads >= MAX_CONCURRENT_DOWNLOADS) return false;
  if (platformQueues[platform].active >= platformQueues[platform].max)
    return false;
  return true;
}

function getEstimatedWaitTime(platform: string): number {
  const queueSize =
    platformQueues[platform].active - platformQueues[platform].max + 1;
  const baseWait =
    platform === "tiktok" ? 90 : platform === "youtube" ? 120 : 60;
  return Math.max(queueSize * baseWait, 60);
}

// 🔧 UNIVERSAL IP ARGS BUILDER
function buildUniversalIPArgs(
  platform: string,
  url: string,
  formatId: string,
  outputTemplate: string
): string[] {
  const baseArgs = [
    "-o",
    outputTemplate,
    "--quiet",
    "--no-warnings",
    "--progress",
    "--newline",
    "--no-check-certificate",
    "--no-part",
    "--no-continue",
    "--no-playlist",
    "--ignore-errors",
    "--no-abort-on-error",
  ];

  switch (platform) {
    case "youtube":
      return [
        ...getYouTubeIPOptimizedArgs(formatId),
        ...baseArgs,
        ...getYouTubeIPHeaders(),
        url,
      ];
    case "instagram":
      return [
        ...getInstagramIPOptimizedArgs(formatId),
        ...baseArgs,
        ...getInstagramIPHeaders(),
        url,
      ];
    case "facebook":
      return [
        ...getFacebookIPOptimizedArgs(formatId),
        ...baseArgs,
        ...getFacebookIPHeaders(),
        url,
      ];
    case "tiktok":
      return [
        ...getTikTokIPOptimizedArgs(formatId),
        ...baseArgs,
        ...getTikTokIPHeaders(),
        url,
      ];
    default:
      return [
        ...getGenericIPOptimizedArgs(formatId),
        ...baseArgs,
        ...getGenericIPHeaders(),
        url,
      ];
  }
}

// 🎬 YOUTUBE WITH IP ROTATION (Already working)
function getYouTubeIPOptimizedArgs(formatId: string): string[] {
  const formatString =
    formatId && formatId !== "auto"
      ? `${formatId}+bestaudio/${formatId}/best[height<=720]`
      : "best[height<=720]/best";

  return [
    "-f",
    formatString,
    "--extractor-args",
    "youtube:player_client=web_embedded,android_creator,ios_music",
    "--extractor-args",
    "youtube:player_skip=dash,hls,configs,webpage",
    "--extractor-args",
    "youtube:skip=translated_subs,dash,hls",
    "--concurrent-fragments",
    "2",
    "--fragment-retries",
    "15",
    "--http-chunk-size",
    "4194304",
    "--buffer-size",
    "32768",
    "--retries",
    "20",
    "--socket-timeout",
    "180",
    "--sleep-interval",
    "8",
    "--max-sleep-interval",
    "20",
    "--continue",
    "--no-overwrites",
    ...(formatString.includes("+bestaudio")
      ? ["--merge-output-format", "mp4"]
      : []),
  ];
}

function getYouTubeIPHeaders(): string[] {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  ];

  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

  return [
    "--user-agent",
    randomUA,
    "--add-header",
    "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "--add-header",
    "Accept-Language:en-US,en;q=0.5",
    "--add-header",
    "DNT:1",
    "--add-header",
    "Connection:keep-alive",
    "--add-header",
    "Cache-Control:no-cache",
  ];
}

// 📸 INSTAGRAM WITH IP ROTATION (NEW)
function getInstagramIPOptimizedArgs(formatId: string): string[] {
  const formatString =
    formatId && formatId !== "auto" ? formatId : "best[height<=1080]/best";

  return [
    "-f",
    formatString,

    // 🔥 INSTAGRAM IP ROTATION OPTIMIZATIONS
    "--concurrent-fragments",
    "3", // Conservative for Instagram
    "--fragment-retries",
    "12", // More retries
    "--http-chunk-size",
    "6291456", // 6MB chunks
    "--buffer-size",
    "65536", // 64KB buffer

    // 🕐 EXTENDED TIMEOUTS for IP rotation
    "--retries",
    "18", // More retries with IP rotation
    "--socket-timeout",
    "120", // 2 minutes
    "--sleep-interval",
    "4", // 4 seconds sleep
    "--max-sleep-interval",
    "10", // Max 10 seconds

    // 🔄 RESUME & ERROR HANDLING
    "--continue",
    "--no-overwrites",
  ];
}

function getInstagramIPHeaders(): string[] {
  const mobileUserAgents = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  ];

  const randomUA =
    mobileUserAgents[Math.floor(Math.random() * mobileUserAgents.length)];

  return [
    "--user-agent",
    randomUA,
    "--add-header",
    "X-Instagram-AJAX:1",
    "--add-header",
    "X-Requested-With:XMLHttpRequest",
    "--add-header",
    "Accept:*/*",
    "--add-header",
    "Accept-Language:en-US,en;q=0.9",
    "--add-header",
    "Sec-Fetch-Dest:empty",
    "--add-header",
    "Sec-Fetch-Mode:cors",
    "--add-header",
    "Sec-Fetch-Site:same-origin",
    "--add-header",
    "Referer:https://www.instagram.com/",
  ];
}

// 📘 FACEBOOK WITH IP ROTATION (NEW)
function getFacebookIPOptimizedArgs(formatId: string): string[] {
  const formatString =
    formatId && formatId !== "auto" ? formatId : "best[height<=720]/best";

  return [
    "-f",
    formatString,

    // 🔥 FACEBOOK IP ROTATION OPTIMIZATIONS
    "--concurrent-fragments",
    "2", // Very conservative for Facebook
    "--fragment-retries",
    "15", // Many retries
    "--http-chunk-size",
    "4194304", // 4MB chunks
    "--buffer-size",
    "32768", // 32KB buffer

    // 🕐 FACEBOOK-SPECIFIC TIMEOUTS
    "--retries",
    "20", // Maximum retries
    "--socket-timeout",
    "150", // 2.5 minutes
    "--sleep-interval",
    "6", // 6 seconds sleep
    "--max-sleep-interval",
    "15", // Max 15 seconds

    // 🔄 RESUME SUPPORT
    "--continue",
    "--no-overwrites",
  ];
}

function getFacebookIPHeaders(): string[] {
  const fbUserAgents = [
    "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  const randomUA =
    fbUserAgents[Math.floor(Math.random() * fbUserAgents.length)];

  return [
    "--user-agent",
    randomUA,
    "--add-header",
    "Accept-Language:en-US,en;q=0.9",
    "--add-header",
    "Referer:https://www.facebook.com/",
    "--add-header",
    "Sec-Fetch-Dest:video",
    "--add-header",
    "Sec-Fetch-Mode:no-cors",
    "--add-header",
    "Sec-Fetch-Site:cross-site",
    "--add-header",
    "DNT:1",
  ];
}

// 🎵 TIKTOK WITH IP ROTATION (NEW)
function getTikTokIPOptimizedArgs(formatId: string): string[] {
  const formatString =
    formatId && formatId !== "auto" ? formatId : "best[height<=720]/best";

  return [
    "-f",
    formatString,

    // 🔥 TIKTOK IP ROTATION OPTIMIZATIONS (Most Conservative)
    "--concurrent-fragments",
    "1", // Single fragment for TikTok
    "--fragment-retries",
    "20", // Maximum retries
    "--http-chunk-size",
    "2097152", // 2MB chunks (small)
    "--buffer-size",
    "16384", // 16KB buffer (small)

    // 🕐 TIKTOK EXTENDED TIMEOUTS (Most Sensitive)
    "--retries",
    "25", // Maximum retries
    "--socket-timeout",
    "200", // 3+ minutes
    "--sleep-interval",
    "8", // 8 seconds sleep (longest)
    "--max-sleep-interval",
    "25", // Max 25 seconds

    // 🔄 TIKTOK SPECIFIC OPTIONS
    "--continue",
    "--no-overwrites",
    "--geo-bypass",
  ];
}

function getTikTokIPHeaders(): string[] {
  const tiktokUserAgents = [
    "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  ];

  const randomUA =
    tiktokUserAgents[Math.floor(Math.random() * tiktokUserAgents.length)];

  return [
    "--user-agent",
    randomUA,
    "--add-header",
    "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "--add-header",
    "Accept-Language:en-US,en;q=0.9",
    "--add-header",
    "Accept-Encoding:gzip, deflate",
    "--add-header",
    "DNT:1",
    "--add-header",
    "Connection:keep-alive",
    "--add-header",
    "Upgrade-Insecure-Requests:1",
    "--add-header",
    "Sec-Fetch-User:?1",
  ];
}

// 🌐 GENERIC WITH IP ROTATION (NEW)
function getGenericIPOptimizedArgs(formatId: string): string[] {
  const formatString =
    formatId && formatId !== "auto" ? formatId : "best[height<=720]/best";

  return [
    "-f",
    formatString,
    "--concurrent-fragments",
    "4",
    "--fragment-retries",
    "10",
    "--http-chunk-size",
    "5242880",
    "--buffer-size",
    "32768",
    "--retries",
    "15",
    "--socket-timeout",
    "120",
    "--sleep-interval",
    "3",
    "--max-sleep-interval",
    "8",
    "--continue",
    "--no-overwrites",
  ];
}

function getGenericIPHeaders(): string[] {
  const genericUserAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  return [
    "--user-agent",
    genericUserAgents[Math.floor(Math.random() * genericUserAgents.length)],
    "--add-header",
    "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "--add-header",
    "Accept-Language:en-US,en;q=0.5",
    "--add-header",
    "DNT:1",
  ];
}

// 🚀 UNIVERSAL IP DOWNLOAD STARTER
function startUniversalIPDownload(
  args: string[],
  downloadId: string,
  platform: string,
  timestamp: number,
  detectedPlatform: string,
  currentIP: string
) {
  console.log(`🚀 Starting ${detectedPlatform} download: ${downloadId}`);
  console.log(`🌐 Using simulated IP: ${currentIP}`);

  const timeoutMs = getOptimalTimeout(detectedPlatform);
  const ytdlp = spawn("yt-dlp", args, {
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    timeout: timeoutMs,
  });

  let hasError = false;
  let lastProgressTime = Date.now();
  const startTime = Date.now();

  if (activeDownloads.has(downloadId)) {
    activeDownloads.get(downloadId).progress.status = "downloading";
    activeDownloads.get(
      downloadId
    ).progress.message = `${detectedPlatform} downloading with IP rotation...`;
  }

  ytdlp.stdout.on("data", (data) => {
    parseOptimizedProgress(data.toString(), downloadId, detectedPlatform);
    lastProgressTime = Date.now();
  });

  ytdlp.stderr.on("data", (data) => {
    const output = data.toString();
    handleUniversalIPErrors(output, downloadId, detectedPlatform, currentIP);
  });

  ytdlp.on("close", (code) => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Update counters
    currentActiveDownloads--;
    platformQueues[detectedPlatform].active--;

    console.log(
      `🏁 ${detectedPlatform} download finished: ${downloadId} | ${duration.toFixed(
        1
      )}s | Code: ${code}`
    );
    console.log(
      `🌐 IP ${currentIP} | Duration: ${duration.toFixed(1)}s | Success: ${
        code === 0
      }`
    );

    if (code === 0 && !hasError) {
      // Record IP success
      universalIPManager.recordIPSuccess(detectedPlatform, currentIP);
      processSuccessfulDownload(
        downloadId,
        platform,
        timestamp,
        duration,
        detectedPlatform
      );
    } else {
      // Record IP failure for quick failures
      if (duration < 15 && code !== 0) {
        universalIPManager.recordIPFailure(detectedPlatform, currentIP);
      }
      handleDownloadFailure(
        downloadId,
        detectedPlatform,
        code,
        duration,
        currentIP
      );
    }
  });

  ytdlp.on("error", (error) => {
    hasError = true;
    currentActiveDownloads--;
    platformQueues[detectedPlatform].active--;

    universalIPManager.recordIPFailure(detectedPlatform, currentIP);
    console.error(`💥 ${detectedPlatform} process error:`, error.message);
    updateProgressError(
      downloadId,
      `Process error: ${error.message}`,
      detectedPlatform
    );
  });

  // Progress timeout checker
  const progressChecker = setInterval(() => {
    const timeoutThreshold = detectedPlatform === "tiktok" ? 300000 : 240000; // 5min for TikTok, 4min others
    if (Date.now() - lastProgressTime > timeoutThreshold) {
      console.log(`⏰ ${detectedPlatform} timeout: ${downloadId}`);
      ytdlp.kill();
      clearInterval(progressChecker);
    }
  }, 30000);

  ytdlp.on("close", () => {
    clearInterval(progressChecker);
  });
}

function getOptimalTimeout(platform: string): number {
  switch (platform) {
    case "youtube":
      return 600000; // 10 minutes
    case "instagram":
      return 300000; // 5 minutes
    case "facebook":
      return 360000; // 6 minutes
    case "tiktok":
      return 420000; // 7 minutes (most sensitive)
    default:
      return 300000; // 5 minutes
  }
}

// 🔧 ENHANCED PROGRESS PARSER (Fixed & Stable)
function parseOptimizedProgress(
  output: string,
  downloadId: string,
  platform: string
) {
  if (!activeDownloads.has(downloadId)) return;

  const download = activeDownloads.get(downloadId);
  const lines = output.split("\n");

  for (const line of lines) {
    // Multiple progress regex patterns for reliability
    let progressMatch = line.match(
      /\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)(?:\s+ETA\s+(\d{2}:\d{2}))?/
    );

    if (!progressMatch) {
      progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%/);
    }

    if (!progressMatch) {
      progressMatch = line.match(
        /(\d{1,3}(?:\.\d+)?)%.*of.*(\d+(?:\.\d+)?\s*[KMGT]?B)/
      );
    }

    if (progressMatch) {
      const percentage = parseFloat(progressMatch[1]);
      const totalSize = progressMatch[2] || null;
      const speed = progressMatch[3] || null;
      const eta = progressMatch[4] || null;

      // Only log significant progress changes to reduce noise
      const lastPercentage = download.progress.percentage || 0;
      if (Math.abs(percentage - lastPercentage) >= 5 || percentage === 100) {
        console.log(
          `📊 ${platform} Progress: ${percentage}% | Speed: ${speed || "N/A"}`
        );
      }

      download.progress = {
        ...download.progress,
        status: "downloading",
        percentage: Math.min(Math.max(percentage, 0), 100),
        speed: speed ? formatSpeed(speed) : null,
        eta: eta,
        totalSize: totalSize ? formatSize(totalSize) : null,
        message: `${platform} downloading via IP... ${percentage.toFixed(1)}% ${
          speed ? "@ " + formatSpeed(speed) : ""
        }`,
        lastUpdate: Date.now(),
      };
      return;
    }

    if (
      line.includes("[download] 100%") ||
      line.includes("has already been downloaded") ||
      line.includes("download completed")
    ) {
      console.log(`🎯 ${platform} download completion detected`);
      download.progress = {
        ...download.progress,
        status: "processing",
        percentage: 100,
        message: `${platform} finalizing download...`,
      };
      return;
    }
  }
}

// 🎯 UNIVERSAL IP ERROR HANDLER
function handleUniversalIPErrors(
  output: string,
  downloadId: string,
  platform: string,
  currentIP: string
) {
  if (output.includes("ERROR")) {
    const error = extractUniversalErrorMessage(output, platform, currentIP);
    if (error) {
      updateProgressError(downloadId, error, platform);
    }
  }
}

function extractUniversalErrorMessage(
  output: string,
  platform: string,
  currentIP: string
): string | null {
  // Common IP/Connection errors
  if (
    output.includes("Connection refused") ||
    output.includes("timeout") ||
    output.includes("Network")
  ) {
    return `Network error with IP ${currentIP}. Auto-rotating to fresh IP...`;
  }

  switch (platform) {
    case "youtube":
      if (output.includes("Sign in to confirm")) {
        return `YouTube anti-bot detected on IP ${currentIP}. Rotating IP automatically...`;
      }
      break;

    case "instagram":
      if (output.includes("login") || output.includes("Please wait")) {
        return `Instagram rate limiting detected on IP ${currentIP}. Auto-rotating IP...`;
      }
      if (output.includes("private") || output.includes("unavailable")) {
        return "Instagram content is private or unavailable. Try different URL.";
      }
      break;

    case "facebook":
      if (output.includes("Unsupported URL")) {
        return "Facebook URL format not supported. Use facebook.com/watch?v=... or fb.watch/...";
      }
      if (output.includes("login") || output.includes("session")) {
        return `Facebook session error on IP ${currentIP}. Auto-rotating IP...`;
      }
      break;

    case "tiktok":
      if (
        output.includes("timed out") ||
        output.includes("Connection timeout")
      ) {
        return `TikTok connection timeout on IP ${currentIP}. Rotating to fresh IP...`;
      }
      if (output.includes("blocked") || output.includes("restricted")) {
        return "TikTok content blocked or restricted. Try different video.";
      }
      break;
  }

  return null;
}

// 🎉 ENHANCED SUCCESS PROCESSOR (Multiple Strategies)
function processSuccessfulDownload(
  downloadId: string,
  platform: string,
  timestamp: number,
  duration: number,
  detectedPlatform: string
) {
  setTimeout(() => {
    try {
      const downloadsDir = path.join(process.cwd(), "public", "downloads");

      if (!fs.existsSync(downloadsDir)) {
        console.log("❌ Downloads directory not found");
        updateProgressError(
          downloadId,
          "Downloads directory not found",
          detectedPlatform
        );
        return;
      }

      const files = fs.readdirSync(downloadsDir);
      console.log(
        `🔍 Looking for files with platform: ${platform}, timestamp: ${timestamp}`
      );
      console.log(`📁 Total files in directory: ${files.length}`);
      console.log(`📂 Recent files:`, files.slice(-5));

      // 🔥 MULTIPLE FILE DETECTION STRATEGIES
      let downloadedFile = null;

      // Strategy 1: Exact timestamp match
      downloadedFile = files.find((file) =>
        file.includes(`${platform}_${timestamp}`)
      );
      console.log(
        `🎯 Strategy 1 (exact timestamp): ${downloadedFile || "Not found"}`
      );

      // Strategy 2: Platform + recent time (3 minutes window)
      if (!downloadedFile) {
        const currentTime = Date.now();
        const timeWindow = 3 * 60 * 1000; // 3 minutes

        downloadedFile = files.find((file) => {
          if (file.includes(platform)) {
            try {
              const filePath = path.join(downloadsDir, file);
              const stats = fs.statSync(filePath);
              return currentTime - stats.mtimeMs < timeWindow;
            } catch (error) {
              return false;
            }
          }
          return false;
        });
        console.log(
          `🎯 Strategy 2 (recent platform): ${downloadedFile || "Not found"}`
        );
      }

      // Strategy 3: Any recent video file (2 minutes)
      if (!downloadedFile) {
        const videoExts = [
          ".mp4",
          ".webm",
          ".mkv",
          ".m4a",
          ".avi",
          ".mov",
          ".flv",
        ];
        const currentTime = Date.now();
        const shortWindow = 2 * 60 * 1000; // 2 minutes

        downloadedFile = files.find((file) => {
          const hasVideoExt = videoExts.some((ext) =>
            file.toLowerCase().endsWith(ext)
          );
          if (hasVideoExt) {
            try {
              const filePath = path.join(downloadsDir, file);
              const stats = fs.statSync(filePath);
              return currentTime - stats.mtimeMs < shortWindow;
            } catch (error) {
              return false;
            }
          }
          return false;
        });
        console.log(
          `🎯 Strategy 3 (recent video): ${downloadedFile || "Not found"}`
        );
      }

      // Strategy 4: Largest recent file (fallback)
      if (!downloadedFile) {
        const currentTime = Date.now();
        const recentFiles = files
          .map((file) => {
            try {
              const filePath = path.join(downloadsDir, file);
              const stats = fs.statSync(filePath);
              return {
                name: file,
                size: stats.size,
                age: currentTime - stats.mtimeMs,
              };
            } catch (error) {
              return null;
            }
          })
          .filter((file) => file && file.age < 180000 && file.size > 10240) // 3 minutes, >10KB
          .sort((a, b) => b.size - a.size);

        if (recentFiles.length > 0) {
          downloadedFile = recentFiles[0].name;
          console.log(`🎯 Strategy 4 (largest recent): ${downloadedFile}`);
        }
      }

      if (downloadedFile) {
        const filePath = path.join(downloadsDir, downloadedFile);
        const fileStats = fs.statSync(filePath);

        if (fileStats.size > 1024) {
          const sizeMB = fileStats.size / (1024 * 1024);
          const speedMBps = duration > 0 ? sizeMB / duration : 0;

          console.log(`✅ FILE FOUND & VERIFIED: ${downloadedFile}`);
          console.log(
            `📊 Size: ${sizeMB.toFixed(1)}MB | Speed: ${speedMBps.toFixed(
              1
            )}MB/s | Duration: ${duration.toFixed(1)}s`
          );

          const download = activeDownloads.get(downloadId);
          if (download) {
            download.progress = {
              ...download.progress,
              status: "completed",
              percentage: 100,
              filename: downloadedFile,
              fileSize: Math.round(sizeMB),
              actualSpeed: speedMBps.toFixed(1),
              message: `${detectedPlatform} completed successfully! File: ${downloadedFile}`,
              completedAt: Date.now(),
              downloadUrl: `/api/download-file?filename=${encodeURIComponent(
                downloadedFile
              )}`,
            };

            console.log(
              `🎉 DOWNLOAD MARKED AS SUCCESSFUL: ${downloadId} → ${downloadedFile}`
            );
            console.log(
              `🔗 Download URL: /api/download-file?filename=${encodeURIComponent(
                downloadedFile
              )}`
            );
          }
        } else {
          console.log(
            `⚠️ File too small: ${downloadedFile} (${fileStats.size} bytes)`
          );
          updateProgressError(
            downloadId,
            `File too small: ${downloadedFile}`,
            detectedPlatform
          );
        }
      } else {
        console.log(`❌ NO FILE FOUND for ${platform}_${timestamp}`);
        updateProgressError(
          downloadId,
          "Downloaded file not found after successful process",
          detectedPlatform
        );
      }
    } catch (err) {
      console.error("💥 File processing error:", err);
      updateProgressError(
        downloadId,
        `File processing failed: ${err.message}`,
        detectedPlatform
      );
    }
  }, 4000); // Wait 4 seconds for file completion
}

function handleDownloadFailure(
  downloadId: string,
  platform: string,
  code: number,
  duration: number,
  currentIP: string
) {
  let message = "";

  if (duration < 15 && code !== 0) {
    // Quick failure = likely IP block
    message = `${platform.toUpperCase()} IP block detected!

🌐 IP Used: ${currentIP}
⏰ Duration: ${duration.toFixed(1)}s (too quick = IP block)
💡 Code: ${code}

🔄 AUTOMATIC ACTIONS:
• IP marked for rotation (${currentIP})
• Will use different IP automatically on next attempt
• ${universalIPManager.getStats(platform).workingIPs} working IPs available

💡 RECOMMENDATION: Try again - fresh IP will be used!`;
  } else {
    const stats = universalIPManager.getStats(platform);
    message = `${platform.toUpperCase()} download failed after ${duration.toFixed(
      1
    )}s.

🌐 IP: ${currentIP}
📊 Status: ${stats.workingIPs}/${stats.totalIPs} IPs working
💡 Code: ${code}

Possible causes:
• Content is private/unavailable  
• Regional restrictions
• Platform-specific limitations

Try: Different ${platform} URL or wait few minutes.`;
  }

  updateProgressError(downloadId, message, platform);
}

function updateProgressError(
  downloadId: string,
  error: string,
  platform: string
) {
  if (activeDownloads.has(downloadId)) {
    const download = activeDownloads.get(downloadId);
    download.progress = {
      ...download.progress,
      status: "error",
      error: error,
      message: `${platform} download failed`,
      failedAt: Date.now(),
    };
    console.error(`❌ ${platform} ERROR (${downloadId}):`, error);
  }
}

// 🔧 HELPER FUNCTIONS
function detectPlatform(url: string): string {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes("instagram.com")) return "instagram";
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be"))
    return "youtube";
  if (cleanUrl.includes("tiktok.com")) return "tiktok";
  if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.watch"))
    return "facebook";
  return "generic";
}

function generateOptimizedId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

function formatSpeed(speed: string): string {
  return speed.replace("iB", "B");
}

function formatSize(size: string): string {
  return size.replace("iB", "B");
}

export { activeDownloads };
