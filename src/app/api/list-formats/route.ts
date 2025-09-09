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
//     let command = `yt-dlp -j --no-warnings --no-playlist --ignore-errors`;

//     // 🎯 PLATFORM-SPECIFIC OPTIMIZATIONS
//     if (url.includes('instagram.com')) {
//       // 📸 INSTAGRAM ENHANCED ANTI-DETECTION
//       console.log("📸 Instagram detected - using stealth mode");

//       command += ` --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"`;
//       command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"`;
//       command += ` --add-header "Accept-Language:en-US,en;q=0.5"`;
//       command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;
//       command += ` --add-header "DNT:1"`;
//       command += ` --add-header "Connection:keep-alive"`;
//       command += ` --add-header "Upgrade-Insecure-Requests:1"`;
//       command += ` --add-header "Sec-Fetch-Dest:document"`;
//       command += ` --add-header "Sec-Fetch-Mode:navigate"`;
//       command += ` --add-header "Sec-Fetch-Site:none"`;
//       command += ` --add-header "Sec-GPC:1"`;
//       command += ` --add-header "Referer:https://www.instagram.com/"`;

//       // 🔥 INSTAGRAM STEALTH SETTINGS
//       command += ` --extractor-retries 10`;
//       command += ` --fragment-retries 8`;
//       command += ` --socket-timeout 150`;  // 2.5 minutes
//       command += ` --sleep-interval 10`;   // Long delays between requests
//       command += ` --max-sleep-interval 25`;
//       command += ` --no-check-certificate`;
//       command += ` --geo-bypass`;
//       command += ` --age-limit 100`;

//       // 🎭 MULTIPLE EXTRACTION METHODS
//       command += ` --extractor-args "instagram:embed=true,api_version=v1"`;

//     } else if (url.includes('tiktok.com')) {
//       // 🎵 TIKTOK OPTIMIZED CONFIGURATION
//       console.log("🎵 TikTok detected - using API bypass");

//       command += ` --extractor-args "tiktok:api_hostname=api22-normal-c-useast2a.tiktokv.com"`;
//       command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
//       command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
//       command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
//       command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;
//       command += ` --add-header "DNT:1"`;
//       command += ` --add-header "Connection:keep-alive"`;
//       command += ` --add-header "Upgrade-Insecure-Requests:1"`;

//       command += ` --socket-timeout 90`;
//       command += ` --extractor-retries 6`;
//       command += ` --fragment-retries 4`;
//       command += ` --sleep-interval 4`;
//       command += ` --max-sleep-interval 10`;
//       command += ` --no-check-certificate`;
//       command += ` --geo-bypass`;

//     } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
//       // 👥 FACEBOOK OPTIMIZED CONFIGURATION
//       console.log("👥 Facebook detected - using FB optimization");

//       command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
//       command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"`;
//       command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
//       command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;
//       command += ` --add-header "DNT:1"`;
//       command += ` --add-header "Connection:keep-alive"`;
//       command += ` --add-header "Upgrade-Insecure-Requests:1"`;
//       command += ` --add-header "Sec-Fetch-Dest:document"`;
//       command += ` --add-header "Sec-Fetch-Mode:navigate"`;

//       command += ` --extractor-retries 7`;
//       command += ` --fragment-retries 5`;
//       command += ` --socket-timeout 120`;
//       command += ` --sleep-interval 5`;
//       command += ` --max-sleep-interval 12`;
//       command += ` --no-check-certificate`;
//       command += ` --geo-bypass`;

//     } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
//       // 📺 YOUTUBE OPTIMIZED CONFIGURATION
//       console.log("📺 YouTube detected - using YT optimization");

//       command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
//       command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
//       command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;

//       // YouTube specific extractors
//       command += ` --extractor-args "youtube:player_client=web"`;
//       command += ` --extractor-args "youtube:skip=dash"`;

//       command += ` --extractor-retries 4`;
//       command += ` --fragment-retries 3`;
//       command += ` --sleep-interval 2`;
//       command += ` --max-sleep-interval 5`;
//       command += ` --socket-timeout 60`;
//       command += ` --no-check-certificate`;
//       command += ` --geo-bypass`;

//     } else {
//       // 🌐 GENERIC PLATFORM CONFIGURATION
//       console.log("🔗 Generic platform detected");

//       command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
//       command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;

//       command += ` --extractor-retries 4`;
//       command += ` --socket-timeout 75`;
//       command += ` --sleep-interval 3`;
//       command += ` --max-sleep-interval 8`;
//       command += ` --no-check-certificate`;
//       command += ` --geo-bypass`;
//     }

//     command += ` "${url}"`;
//     console.log("🛡️ Executing platform-optimized command...");

//     try {
//       // 🕒 PLATFORM-SPECIFIC TIMEOUTS
//       let timeoutMs = 90000; // Default 1.5 minutes
//       if (url.includes('instagram.com')) timeoutMs = 180000; // 3 minutes for Instagram
//       else if (url.includes('tiktok.com')) timeoutMs = 60000;   // 1 minute for TikTok
//       else if (url.includes('facebook.com')) timeoutMs = 120000; // 2 minutes for Facebook
//       else if (url.includes('youtube.com')) timeoutMs = 75000;   // 1.25 minutes for YouTube

//       const { stdout, stderr } = await execAsync(command, {
//         timeout: timeoutMs,
//         maxBuffer: 1024 * 1024 * 100, // 100MB buffer
//         env: {
//           ...process.env,
//           PYTHONUNBUFFERED: '1',
//           LANG: 'en_US.UTF-8',
//         }
//       });

//       // 🚨 PLATFORM-SPECIFIC ERROR HANDLING
//       if (stderr) {
//         console.log("⚠️ yt-dlp stderr:", stderr.substring(0, 500));

//         // 📸 INSTAGRAM ERROR HANDLING
//         if (url.includes('instagram.com')) {
//           if (stderr.includes("rate-limit") || stderr.includes("login required") || stderr.includes("not available")) {
//             return NextResponse.json({
//               success: false,
//               error: "Instagram Access Restricted",
//               message: "Instagram is currently limiting access to this content.\n\n" +
//                        "🔍 Possible reasons:\n" +
//                        "• Video is from a private account\n" +
//                        "• Instagram detected automated access (rate limiting)\n" +
//                        "• Content has been deleted or restricted\n" +
//                        "• Geographic restrictions apply\n\n" +
//                        "💡 Solutions:\n" +
//                        "• Wait 15-30 minutes and try again\n" +
//                        "• Ensure the Instagram post is public\n" +
//                        "• Try a different Instagram video\n" +
//                        "• Check if the URL is correct",
//               suggestion: "Instagram frequently blocks automated requests. This is normal behavior.",
//               platform: "instagram",
//               retryAfter: 1800 // 30 minutes
//             }, { status: 429 });
//           }
//         }

//         // 🎵 TIKTOK ERROR HANDLING
//         if (url.includes('tiktok.com')) {
//           if (stderr.includes("timed out") || stderr.includes("Connection timeout") || stderr.includes("blocked")) {
//             return NextResponse.json({
//               success: false,
//               error: "TikTok Request Blocked",
//               message: "TikTok has blocked this request (expected behavior).\n\n" +
//                        "🔒 Why this happens:\n" +
//                        "• TikTok actively prevents automated downloads\n" +
//                        "• Strong anti-bot protection is always active\n" +
//                        "• This is normal and expected behavior\n\n" +
//                        "🛠️ Alternative solutions:\n" +
//                        "• Try a different TikTok video\n" +
//                        "• Use TikTok's built-in save feature\n" +
//                        "• Try again in a few hours\n" +
//                        "• Consider using dedicated TikTok downloaders",
//               suggestion: "TikTok blocks are normal. Try alternative methods or wait.",
//               platform: "tiktok",
//               alternatives: [
//                 { name: "SnapTik", url: "snaptik.app" },
//                 { name: "SaveTT", url: "savett.cc" },
//                 { name: "TikMate", url: "tikmate.online" }
//               ]
//             }, { status: 408 });
//           }
//         }

//         // 👥 FACEBOOK ERROR HANDLING
//         if (url.includes('facebook.com') || url.includes('fb.watch')) {
//           if (stderr.includes("Unsupported URL") || stderr.includes("not supported")) {
//             return NextResponse.json({
//               success: false,
//               error: "Facebook URL Format Error",
//               message: "This Facebook URL format is not supported.\n\n" +
//                        "✅ Supported URL formats:\n" +
//                        "• facebook.com/watch?v=1234567890\n" +
//                        "• fb.watch/abc123xyz\n" +
//                        "• facebook.com/username/videos/1234567890\n\n" +
//                        "❌ Not supported:\n" +
//                        "• facebook.com/share/...\n" +
//                        "• facebook.com/reel/...\n" +
//                        "• facebook.com/story/...\n" +
//                        "• Private or group video links",
//               suggestion: "Use standard Facebook video URLs only.",
//               platform: "facebook"
//             }, { status: 400 });
//           }
//         }

//         // 📺 YOUTUBE ERROR HANDLING
//         if (url.includes('youtube.com') || url.includes('youtu.be')) {
//           if (stderr.includes("Sign in") || stderr.includes("age-restricted")) {
//             return NextResponse.json({
//               success: false,
//               error: "YouTube Access Restricted",
//               message: "This YouTube video requires special access.\n\n" +
//                        "🚫 Common restrictions:\n" +
//                        "• Age-restricted content\n" +
//                        "• Private or unlisted video\n" +
//                        "• Geographic restrictions\n" +
//                        "• Premium or membership-only content\n\n" +
//                        "💡 Try:\n" +
//                        "• Public, non-restricted videos\n" +
//                        "• Different YouTube video\n" +
//                        "• Check if video URL is correct",
//               suggestion: "Use public, unrestricted YouTube videos.",
//               platform: "youtube"
//             }, { status: 403 });
//           }
//         }

//         // 🌐 GENERAL ERROR HANDLING
//         if (stderr.includes("HTTP Error 403") || stderr.includes("Forbidden")) {
//           return NextResponse.json({
//             success: false,
//             error: "Access Denied",
//             message: "Access to this content is restricted.\n\n" +
//                      "This could be due to:\n" +
//                      "• Private or protected content\n" +
//                      "• Geographic restrictions\n" +
//                      "• Platform anti-bot measures\n" +
//                      "• Authentication requirements",
//             platform: detectPlatform(url)
//           }, { status: 403 });
//         }

//         if (stderr.includes("Private video") || stderr.includes("Video unavailable") || stderr.includes("not found")) {
//           return NextResponse.json({
//             success: false,
//             error: "Video Not Available",
//             message: "The requested video is not accessible.\n\n" +
//                      "Possible reasons:\n" +
//                      "• Video has been deleted\n" +
//                      "• Private or restricted content\n" +
//                      "• Incorrect URL\n" +
//                      "• Regional restrictions",
//             platform: detectPlatform(url)
//           }, { status: 404 });
//         }

//         // Continue processing if only warnings
//         if (!stderr.includes("ERROR:") && !stderr.includes("CRITICAL:")) {
//           console.log("⚠️ Only warnings detected, continuing processing...");
//         }
//       }

//       // 📋 VALIDATE RESPONSE
//       if (!stdout || stdout.trim() === "") {
//         return NextResponse.json({
//           success: false,
//           error: "Empty Response",
//           message: "No video information was received.\n\n" +
//                    "This could indicate:\n" +
//                    "• Video is unavailable or private\n" +
//                    "• Network connectivity issues\n" +
//                    "• Platform restrictions are active\n" +
//                    "• Invalid or malformed URL",
//           platform: detectPlatform(url)
//         }, { status: 500 });
//       }

//       // 🔍 PARSE JSON RESPONSE
//       let videoInfo;
//       try {
//         videoInfo = JSON.parse(stdout.trim());
//       } catch (parseError) {
//         console.error("❌ JSON parse error:", parseError);
//         return NextResponse.json({
//           success: false,
//           error: "Invalid Response Format",
//           message: "Received invalid data from video source.\n\n" +
//                    "This usually means:\n" +
//                    "• Platform returned non-standard response\n" +
//                    "• Partial data due to interruption\n" +
//                    "• Platform-specific restrictions",
//           platform: detectPlatform(url)
//         }, { status: 500 });
//       }

//       // 🎬 HANDLE MISSING FORMATS
//       if (!videoInfo.formats || !Array.isArray(videoInfo.formats)) {
//         if (videoInfo.url) {
//           // Create default format from direct URL
//           videoInfo.formats = [{
//             format_id: 'best',
//             url: videoInfo.url,
//             ext: videoInfo.ext || 'mp4',
//             quality: 'default',
//             vcodec: 'h264',
//             acodec: 'aac',
//             format_note: 'Direct URL'
//           }];
//         } else {
//           return NextResponse.json({
//             success: false,
//             error: "No Downloadable Formats",
//             message: "This video has no available download formats.\n\n" +
//                      "Possible reasons:\n" +
//                      "• Content is protected or DRM-protected\n" +
//                      "• Platform restrictions prevent extraction\n" +
//                      "• Live stream or premium content\n" +
//                      "• Technical limitations",
//             platform: detectPlatform(url)
//           }, { status: 500 });
//         }
//       }

//       console.log(`✅ Successfully extracted ${videoInfo.formats.length} formats for: ${videoInfo.title || "Unknown Title"}`);

//       // 🔄 PROCESS AND OPTIMIZE FORMATS
//       const processedFormats = processFormats(videoInfo.formats);

//       return NextResponse.json({
//         success: true,
//         title: videoInfo.title || "Unknown Title",
//         description: videoInfo.description?.substring(0, 200) || "",
//         duration: formatDuration(videoInfo.duration),
//         thumbnail: getBestThumbnail(videoInfo),
//         uploader: videoInfo.uploader || videoInfo.channel || videoInfo.creator || "Unknown",
//         upload_date: formatUploadDate(videoInfo.upload_date),
//         view_count: formatNumber(videoInfo.view_count),
//         like_count: formatNumber(videoInfo.like_count),
//         formats: processedFormats.all,
//         recommended: processedFormats.recommended,
//         videoOnly: processedFormats.videoOnly,
//         audioOnly: processedFormats.audioOnly,
//         combined: processedFormats.combined,
//         platform: detectPlatform(url),
//         url: url,
//         extracted_at: new Date().toISOString()
//       });

//     } catch (execError: any) {
//       console.error("💥 yt-dlp execution error:", execError);

//       let errorMessage = "Video Processing Failed";
//       let suggestion = "";
//       let statusCode = 500;
//       let retryAfter = null;

//       // 🔍 DETAILED ERROR ANALYSIS
//       if (execError.code === "ENOENT") {
//         errorMessage = "yt-dlp Not Found";
//         suggestion = "Server configuration issue. Please contact support.";
//         statusCode = 503;
//       } else if (execError.signal === "SIGTERM" || execError.code === "TIMEOUT") {
//         if (url.includes('instagram.com')) {
//           errorMessage = "Instagram Request Timeout";
//           suggestion = "Instagram is actively limiting requests. Please wait 20-30 minutes before trying again.";
//           statusCode = 429;
//           retryAfter = 1800; // 30 minutes
//         } else if (url.includes('tiktok.com')) {
//           errorMessage = "TikTok Request Blocked";
//           suggestion = "TikTok has blocked this request. This is expected behavior due to their anti-bot protection.";
//           statusCode = 408;
//         } else if (url.includes('facebook.com')) {
//           errorMessage = "Facebook Request Timeout";
//           suggestion = "Facebook request took too long. Try again or use a different video.";
//           statusCode = 408;
//         } else {
//           errorMessage = "Request Timeout";
//           suggestion = "The request took too long to process. Please try again.";
//           statusCode = 408;
//         }
//       } else if (execError.stderr?.includes("Network") || execError.stderr?.includes("connection")) {
//         errorMessage = "Network Connection Error";
//         suggestion = "Please check your internet connection and try again.";
//         statusCode = 503;
//       }

//       return NextResponse.json({
//         success: false,
//         error: errorMessage,
//         message: suggestion,
//         platform: detectPlatform(url),
//         retryAfter: retryAfter,
//         details: execError.stderr ? execError.stderr.substring(0, 300) : "No additional details available"
//       }, { status: statusCode });
//     }

//   } catch (error: any) {
//     console.error("💀 Fatal error in format listing:", error);
//     return NextResponse.json({
//       success: false,
//       error: "Internal Server Error",
//       message: "An unexpected error occurred while processing your request.",
//       platform: "unknown"
//     }, { status: 500 });
//   }
// }

// // 🎯 HELPER FUNCTIONS

// function detectPlatform(url: string): string {
//   const cleanUrl = url.toLowerCase();
//   if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
//   if (cleanUrl.includes('instagram.com')) return 'instagram';
//   if (cleanUrl.includes('tiktok.com')) return 'tiktok';
//   if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) return 'facebook';
//   if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) return 'twitter';
//   if (cleanUrl.includes('vimeo.com')) return 'vimeo';
//   if (cleanUrl.includes('dailymotion.com')) return 'dailymotion';
//   return 'unknown';
// }

// function processFormats(formats: any[]) {
//   const all: any[] = [];
//   const recommended: any[] = [];
//   const videoOnly: any[] = [];
//   const audioOnly: any[] = [];
//   const combined: any[] = [];
//   const seenFormats = new Set<string>();

//   // 🔄 PROCESS EACH FORMAT
//   formats.forEach((format) => {
//     if (!format.format_id && !format.url) return;

//     const processedFormat = {
//       format_id: format.format_id || 'best',
//       ext: format.ext || "mp4",
//       quality: getQualityLabel(format),
//       resolution: getResolution(format),
//       filesize: getFileSize(format.filesize),
//       filesizeMB: getFileSizeMB(format.filesize),
//       fps: format.fps || null,
//       vcodec: format.vcodec || 'h264',
//       acodec: format.acodec || 'aac',
//       tbr: Math.round(format.tbr || 0),
//       vbr: Math.round(format.vbr || 0),
//       abr: Math.round(format.abr || 0),
//       type: getFormatType(format),
//       note: format.format_note || "",
//       isRecommended: isRecommendedFormat(format),
//       language: format.language || null,
//       preference: format.preference || 0
//     };

//     // 🚫 AVOID DUPLICATES
//     const uniqueKey = `${processedFormat.quality}_${processedFormat.ext}_${processedFormat.type}_${processedFormat.fps || 0}_${processedFormat.tbr}`;

//     if (seenFormats.has(uniqueKey)) return;
//     seenFormats.add(uniqueKey);

//     all.push(processedFormat);

//     // 📂 CATEGORIZE FORMATS
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

//   // 📊 SORT BY QUALITY
//   const sortByQuality = (a: any, b: any) => {
//     const aHeight = parseInt(a.resolution) || 0;
//     const bHeight = parseInt(b.resolution) || 0;
//     if (aHeight !== bHeight) return bHeight - aHeight;

//     // Secondary sort by bitrate
//     return (b.tbr || 0) - (a.tbr || 0);
//   };

//   const sortByBitrate = (a: any, b: any) => {
//     return (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0);
//   };

//   // 🔧 FINAL PROCESSING
//   const finalAll = removeSimilarFormats(all.sort(sortByQuality));
//   const finalRecommended = removeSimilarFormats(recommended.sort(sortByQuality)).slice(0, 6);
//   const finalVideoOnly = removeSimilarFormats(videoOnly.sort(sortByQuality));
//   const finalAudioOnly = removeSimilarFormats(audioOnly.sort(sortByBitrate));
//   const finalCombined = removeSimilarFormats(combined.sort(sortByQuality));

//   console.log(`🔄 Processed ${formats.length} raw formats → ${finalAll.length} unique formats`);

//   return {
//     all: finalAll,
//     recommended: finalRecommended,
//     videoOnly: finalVideoOnly,
//     audioOnly: finalAudioOnly,
//     combined: finalCombined,
//   };
// }

// function removeSimilarFormats(formats: any[]): any[] {
//   const uniqueQualities = new Map<string, any>();

//   formats.forEach(format => {
//     const qualityKey = `${format.quality}_${format.type}`;

//     if (!uniqueQualities.has(qualityKey)) {
//       uniqueQualities.set(qualityKey, format);
//     } else {
//       const existing = uniqueQualities.get(qualityKey);

//       // 🏆 PREFER BETTER FORMATS
//       if (format.ext === 'mp4' && existing.ext !== 'mp4') {
//         uniqueQualities.set(qualityKey, format);
//       } else if (format.filesizeMB > existing.filesizeMB && format.filesizeMB > 0) {
//         uniqueQualities.set(qualityKey, format);
//       } else if (format.isRecommended && !existing.isRecommended) {
//         uniqueQualities.set(qualityKey, format);
//       } else if (format.tbr > existing.tbr) {
//         uniqueQualities.set(qualityKey, format);
//       }
//     }
//   });

//   return Array.from(uniqueQualities.values());
// }

// function getQualityLabel(format: any): string {
//   if (format.height) return `${format.height}p`;
//   if (format.format_note) {
//     const note = format.format_note.toLowerCase();
//     if (note.includes('audio')) return note;
//     return format.format_note;
//   }
//   if (format.abr) return `${format.abr}kbps`;
//   if (format.quality) return format.quality.toString();
//   return "default";
// }

// function getResolution(format: any): string {
//   if (format.height && format.width) {
//     return `${format.width}x${format.height}`;
//   }
//   if (format.height) {
//     const width = Math.round(format.height * 16 / 9); // Assume 16:9 aspect ratio
//     return `${width}x${format.height}`;
//   }
//   if (format.width) {
//     const height = Math.round(format.width * 9 / 16);
//     return `${format.width}x${height}`;
//   }
//   return "audio";
// }

// function getFileSize(size: number | null): string {
//   if (!size || size <= 0) return "unknown";

//   const bytes = size;
//   const mb = bytes / (1024 * 1024);
//   const gb = mb / 1024;

//   if (gb >= 1) return `${gb.toFixed(1)}GB`;
//   if (mb >= 0.1) return `${mb.toFixed(1)}MB`;
//   return `${(bytes / 1024).toFixed(0)}KB`;
// }

// function getFileSizeMB(size: number | null): number {
//   if (!size || size <= 0) return 0;
//   return Math.round((size / (1024 * 1024)) * 10) / 10;
// }

// function getFormatType(format: any): string {
//   const hasVideo = format.vcodec && format.vcodec !== "none" && format.vcodec !== "null";
//   const hasAudio = format.acodec && format.acodec !== "none" && format.acodec !== "null";

//   if (hasVideo && hasAudio) return "video+audio";
//   if (hasVideo && !hasAudio) return "video";
//   if (!hasVideo && hasAudio) return "audio";

//   // Fallback logic
//   if (format.height || format.width || format.fps) return "video";
//   if (format.abr || format.asr) return "audio";

//   return "video+audio"; // Default assumption
// }

// function isRecommendedFormat(format: any): boolean {
//   // 🏅 RECOMMENDED CRITERIA
//   const hasVideo = format.vcodec && format.vcodec !== "none";
//   const hasAudio = format.acodec && format.acodec !== "none";

//   // Direct best format
//   if (format.format_id === 'best') return true;

//   // Combined MP4 formats
//   if (hasVideo && hasAudio && format.ext === "mp4") return true;

//   // Standard resolutions with audio
//   if (format.height && [360, 480, 720, 1080].includes(format.height) && hasAudio) return true;

//   // High quality video-only formats
//   if (hasVideo && !hasAudio && format.height >= 720) return false; // Don't recommend video-only

//   // Audio formats with good bitrate
//   if (!hasVideo && hasAudio && format.abr >= 128) return true;

//   return false;
// }

// function formatDuration(seconds: number | null): string {
//   if (!seconds || seconds <= 0) return "";

//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);

//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//   }
//   return `${minutes}:${secs.toString().padStart(2, "0")}`;
// }

// function formatNumber(num: number | null): string {
//   if (!num || num <= 0) return "";

//   if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
//   if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
//   if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;

//   return num.toLocaleString();
// }

// function getBestThumbnail(videoInfo: any): string {
//   if (videoInfo.thumbnail) return videoInfo.thumbnail;

//   if (videoInfo.thumbnails && Array.isArray(videoInfo.thumbnails)) {
//     // Sort by preference: larger thumbnails first
//     const sortedThumbnails = videoInfo.thumbnails
//       .filter((t: any) => t.url)
//       .sort((a: any, b: any) => {
//         const aSize = (a.width || 0) * (a.height || 0);
//         const bSize = (b.width || 0) * (b.height || 0);
//         return bSize - aSize;
//       });

//     if (sortedThumbnails.length > 0) {
//       return sortedThumbnails[0].url;
//     }
//   }

//   return "";
// }

// function formatUploadDate(date: string | null): string {
//   if (!date) return "";

//   try {
//     // yt-dlp returns dates in YYYYMMDD format
//     if (date.length === 8) {
//       const year = date.substring(0, 4);
//       const month = date.substring(4, 6);
//       const day = date.substring(6, 8);
//       return `${year}-${month}-${day}`;
//     }

//     return date;
//   } catch {
//     return "";
//   }
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
      return NextResponse.json(
        {
          success: false,
          error: "URL parameter required",
        },
        { status: 400 }
      );
    }

    // 🔥 ADD UNIQUE REQUEST ID TO PREVENT SEQUENCE ISSUES
    const requestId =
      Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    const urlHash = Buffer.from(url).toString("base64").substr(0, 16);

    console.log(`🎥 Processing [${requestId}] for URL: ${url}`);

    // 🚀 ENHANCED COMMAND FOR ALL QUALITY FORMATS
    let command = `yt-dlp --dump-single-json --no-warnings --ignore-errors --skip-unavailable-fragments`;

    // 🎯 FORCE ALL FORMATS EXTRACTION
    command += ` --all-formats --list-formats`;

    // Random user agent for IP protection
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    ];
    const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
    command += ` --user-agent "${randomUA}"`;

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      console.log("📺 YouTube - ALL QUALITY MODE");
      // Force all available formats including premium quality
      command += ` --extractor-args "youtube:player_client=android,ios,web"`;
      command += ` --extractor-args "youtube:skip=live_chat"`;
      command += ` --format-sort "quality,res:2160,fps,codec:h264"`;
    } else if (url.includes("instagram.com")) {
      console.log("📸 Instagram - HD Mode");
      command += ` --add-header "Referer:https://www.instagram.com/"`;
    }

    command += ` --socket-timeout 25 --geo-bypass "${url}"`;

    try {
      // First, get JSON info
      const jsonCommand = command.replace("--all-formats --list-formats", "");
      const { stdout: jsonOutput } = await execAsync(jsonCommand, {
        timeout: 20000,
        maxBuffer: 1024 * 1024 * 15,
      });

      if (!jsonOutput || jsonOutput.trim() === "") {
        throw new Error("Empty JSON response");
      }

      const videoInfo = JSON.parse(jsonOutput.trim());

      // 🎬 EXTRACT ALL AVAILABLE FORMATS (Including High Quality)
      const allFormats = extractAllQualityFormats(videoInfo.formats || []);

      if (allFormats.length === 0) {
        // Fallback: Try format listing approach
        const listCommand = `yt-dlp --list-formats --no-warnings "${url}"`;
        const { stdout: listOutput } = await execAsync(listCommand, {
          timeout: 15000,
          maxBuffer: 1024 * 1024 * 10,
        });

        if (listOutput) {
          const parsedFormats = parseFormatList(listOutput);
          if (parsedFormats.length > 0) {
            return NextResponse.json(
              {
                success: true,
                title: videoInfo.title || "Unknown Title",
                duration: formatDuration(videoInfo.duration),
                thumbnail: videoInfo.thumbnail || getBestThumbnail(videoInfo),
                uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
                platform: detectPlatform(url),
                formats: parsedFormats,
                total_formats: parsedFormats.length,
                extraction_method: "format-list-fallback",
                extracted_at: Date.now(),
                // 🔥 ADD UNIQUE IDENTIFIERS
                request_id: requestId,
                url_hash: urlHash,
                original_url: url,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  // 🚫 NO CACHE - Always fetch fresh data
                  "Cache-Control":
                    "no-cache, no-store, must-revalidate, max-age=0",
                  Pragma: "no-cache",
                  Expires: "0",
                  // 🔥 PREVENT SEQUENCE ISSUES
                  "X-Request-ID": requestId,
                  "X-URL-Hash": urlHash,
                },
              }
            );
          }
        }
      }

      console.log(
        `✅ Success [${requestId}]: Found ${allFormats.length} formats for ${videoInfo.title}`
      );

      return NextResponse.json(
        {
          success: true,
          title: videoInfo.title || "Unknown Title",
          duration: formatDuration(videoInfo.duration),
          thumbnail: videoInfo.thumbnail || getBestThumbnail(videoInfo),
          uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
          view_count: formatNumber(videoInfo.view_count),
          platform: detectPlatform(url),
          formats: allFormats,
          total_formats: allFormats.length,
          extraction_method: "json-extraction",
          extracted_at: Date.now(),
          // 🔥 ADD UNIQUE IDENTIFIERS
          request_id: requestId,
          url_hash: urlHash,
          original_url: url,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // 🚫 NO CACHE - Always fetch fresh data
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            // 🔥 PREVENT SEQUENCE ISSUES
            "X-Request-ID": requestId,
            "X-URL-Hash": urlHash,
          },
        }
      );
    } catch (execError: any) {
      console.error(
        `💥 Execution failed [${requestId}]:`,
        execError.message?.substring(0, 100)
      );

      return NextResponse.json(
        {
          success: false,
          error: "extraction_failed",
          message: "Unable to extract high-quality formats",
          platform: detectPlatform(url),
          request_id: requestId,
          url_hash: urlHash,
          original_url: url,
        },
        {
          status: 422,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }
  } catch (error: any) {
    console.error("💀 Fatal error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}

// 🔧 ENHANCED FORMAT EXTRACTION (All Qualities)
function extractAllQualityFormats(formats: any[]) {
  if (!Array.isArray(formats) || formats.length === 0) return [];

  const uniqueMap = new Map();
  const processed: any[] = [];

  // Sort by quality first (highest to lowest)
  const sortedFormats = formats.sort((a, b) => {
    const aHeight = a.height || 0;
    const bHeight = b.height || 0;
    if (aHeight !== bHeight) return bHeight - aHeight;
    return (b.tbr || 0) - (a.tbr || 0);
  });

  for (const format of sortedFormats) {
    if (!format || !format.format_id) continue;

    // Skip MHTML and other low-quality formats unless no better option
    if (format.ext === "mhtml" && processed.length > 0) continue;
    if (format.protocol === "m3u8_native" && processed.length > 3) continue;

    // Create comprehensive unique key
    const quality = getQualityLabel(format);
    const resolution = getResolution(format);
    const type = getFormatType(format);
    const uniqueKey = `${quality}_${resolution}_${type}_${format.ext || "mp4"}`;

    // Skip exact duplicates
    if (uniqueMap.has(uniqueKey)) continue;
    uniqueMap.set(uniqueKey, true);

    const processedFormat = {
      format_id: format.format_id,
      ext: format.ext || "mp4",
      quality: quality,
      resolution: resolution,
      filesize: getFileSize(format.filesize || format.filesize_approx),
      vcodec: format.vcodec === "none" ? null : format.vcodec || "h264",
      acodec: format.acodec === "none" ? null : format.acodec || "aac",
      fps: format.fps || null,
      tbr: Math.round(format.tbr || 0),
      vbr: Math.round(format.vbr || 0),
      abr: Math.round(format.abr || 0),
      type: type,
      note: format.format_note || "",
      protocol: format.protocol || "https",
      height: format.height || null,
      width: format.width || null,
      is_premium:
        format.format_note?.toLowerCase().includes("premium") || false,
    };

    processed.push(processedFormat);
  }

  // Return top 20 formats (including all qualities from 4K to 144p)
  return processed.slice(0, 20);
}

// 🔧 FORMAT LIST PARSER (Fallback Method)
function parseFormatList(listOutput: string) {
  const lines = listOutput.split("\n");
  const formats: any[] = [];

  for (const line of lines) {
    if (line.includes("mp4") || line.includes("webm") || line.includes("m4a")) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 3) {
        const formatId = parts[0];
        const ext = parts[1] || "mp4";
        const quality = parts[2] || "unknown";

        // Extract resolution if available
        let resolution = "audio";
        let height = null;

        const resMatch = line.match(/(\d+)x(\d+)/);
        if (resMatch) {
          resolution = `${resMatch[1]}x${resMatch[2]}`;
          height = parseInt(resMatch[2]);
        } else {
          const heightMatch = line.match(/(\d+)p/);
          if (heightMatch) {
            height = parseInt(heightMatch[1]);
            resolution = `${Math.round((height * 16) / 9)}x${height}`;
          }
        }

        formats.push({
          format_id: formatId,
          ext: ext,
          quality: height ? `${height}p` : quality,
          resolution: resolution,
          filesize: "unknown",
          vcodec: ext === "m4a" ? null : "h264",
          acodec: line.includes("video only") ? null : "aac",
          fps: null,
          tbr: 0,
          type: getFormatTypeFromExt(ext, line),
          note: "",
          protocol: "https",
          height: height,
        });
      }
    }
  }

  // Sort by height (quality) descending
  return formats.sort((a, b) => (b.height || 0) - (a.height || 0));
}

// 🛠️ HELPER FUNCTIONS
function getFormatTypeFromExt(ext: string, line: string): string {
  if (ext === "m4a" || line.includes("audio only")) return "audio";
  if (line.includes("video only")) return "video";
  return "video+audio";
}

function getQualityLabel(format: any): string {
  if (format.height) {
    // Map common YouTube qualities
    if (format.height >= 2160) return "4K";
    if (format.height >= 1440) return "1440p";
    if (format.height >= 1080) return "1080p";
    if (format.height >= 720) return "720p";
    if (format.height >= 480) return "480p";
    if (format.height >= 360) return "360p";
    return `${format.height}p`;
  }

  if (format.format_note) {
    const note = format.format_note.toLowerCase();
    if (note.includes("4k") || note.includes("2160p")) return "4K";
    if (note.includes("1440p")) return "1440p";
    if (note.includes("1080p")) return "1080p";
    if (note.includes("720p")) return "720p";
    if (note.includes("480p")) return "480p";
    if (note.includes("360p")) return "360p";
    if (note.includes("audio")) return format.format_note;
    return format.format_note;
  }

  if (format.abr) return `${format.abr}kbps`;
  return "default";
}

function getResolution(format: any): string {
  if (format.height && format.width) return `${format.width}x${format.height}`;
  if (format.height)
    return `${Math.round((format.height * 16) / 9)}x${format.height}`;
  return "audio";
}

function getFileSize(size: number | null): string {
  if (!size || size <= 0) return "unknown";
  const gb = size / (1024 * 1024 * 1024);
  const mb = size / (1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  if (mb >= 1) return `${mb.toFixed(1)}MB`;
  return `${(size / 1024).toFixed(0)}KB`;
}

function getFormatType(format: any): string {
  const hasVideo = format.vcodec && format.vcodec !== "none";
  const hasAudio = format.acodec && format.acodec !== "none";

  if (hasVideo && hasAudio) return "video+audio";
  if (hasVideo) return "video";
  if (hasAudio) return "audio";
  return "unknown";
}

function detectPlatform(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("facebook.com")) return "facebook";
  return "generic";
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatNumber(num: number | null): string {
  if (!num) return "";
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function getBestThumbnail(data: any): string {
  if (data.thumbnail) return data.thumbnail;
  if (data.thumbnails && Array.isArray(data.thumbnails)) {
    const best = data.thumbnails
      .filter((t:any) => t && t.url)
      .sort(
        (a:any, b:any) =>
          (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
      )[0];
    return best?.url || "";
  }
  return "";
}
