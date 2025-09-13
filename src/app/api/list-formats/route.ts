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

// import { NextRequest, NextResponse } from "next/server";
// import { exec } from "child_process";
// import { promisify } from "util";

// const execAsync = promisify(exec);

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const url = searchParams.get("url");

//     if (!url) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "URL parameter required",
//         },
//         { status: 400 }
//       );
//     }

//     console.log("🎥 Processing for ALL qualities:", url);

//     // 🚀 ENHANCED COMMAND FOR ALL QUALITY FORMATS
//     let command = `yt-dlp --dump-single-json --no-warnings --ignore-errors --skip-unavailable-fragments`;

//     // 🎯 FORCE ALL FORMATS EXTRACTION
//     command += ` --all-formats --list-formats`;

//     // Random user agent for IP protection
//     const userAgents = [
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
//       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
//     ];
//     const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
//     command += ` --user-agent "${randomUA}"`;

//     if (url.includes("youtube.com") || url.includes("youtu.be")) {
//       console.log("📺 YouTube - ALL QUALITY MODE");
//       // Force all available formats including premium quality
//       command += ` --extractor-args "youtube:player_client=android,ios,web"`;
//       command += ` --extractor-args "youtube:skip=live_chat"`;
//       command += ` --format-sort "quality,res:2160,fps,codec:h264"`;
//     } else if (url.includes("instagram.com")) {
//       console.log("📸 Instagram - HD Mode");
//       command += ` --add-header "Referer:https://www.instagram.com/"`;
//     }

//     command += ` --socket-timeout 25 --geo-bypass "${url}"`;

//     try {
//       // First, get JSON info
//       const jsonCommand = command.replace("--all-formats --list-formats", "");
//       const { stdout: jsonOutput } = await execAsync(jsonCommand, {
//         timeout: 20000,
//         maxBuffer: 1024 * 1024 * 15,
//       });

//       if (!jsonOutput || jsonOutput.trim() === "") {
//         throw new Error("Empty JSON response");
//       }

//       const videoInfo = JSON.parse(jsonOutput.trim());

//       // 🎬 EXTRACT ALL AVAILABLE FORMATS (Including High Quality)
//       const allFormats = extractAllQualityFormats(videoInfo.formats || []);

//       if (allFormats.length === 0) {
//         // Fallback: Try format listing approach
//         const listCommand = `yt-dlp --list-formats --no-warnings "${url}"`;
//         const { stdout: listOutput } = await execAsync(listCommand, {
//           timeout: 15000,
//           maxBuffer: 1024 * 1024 * 10,
//         });

//         if (listOutput) {
//           const parsedFormats = parseFormatList(listOutput);
//           if (parsedFormats.length > 0) {
//             return NextResponse.json({
//               success: true,
//               title: videoInfo.title || "Unknown Title",
//               duration: formatDuration(videoInfo.duration),
//               thumbnail: videoInfo.thumbnail || getBestThumbnail(videoInfo),
//               uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
//               platform: detectPlatform(url),
//               formats: parsedFormats,
//               total_formats: parsedFormats.length,
//               extraction_method: "format-list-fallback",
//               extracted_at: Date.now(),
//             });
//           }
//         }
//       }

//       return NextResponse.json(
//         {
//           success: true,
//           title: videoInfo.title || "Unknown Title",
//           duration: formatDuration(videoInfo.duration),
//           thumbnail: videoInfo.thumbnail || getBestThumbnail(videoInfo),
//           uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
//           view_count: formatNumber(videoInfo.view_count),
//           platform: detectPlatform(url),
//           formats: allFormats,
//           total_formats: allFormats.length,
//           extraction_method: "json-extraction",
//           extracted_at: Date.now(),
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "public, max-age=600",
//           },
//         }
//       );
//     } catch (execError: any) {
//       console.error(
//         "💥 Execution failed:",
//         execError.message?.substring(0, 100)
//       );

//       return NextResponse.json(
//         {
//           success: false,
//           error: "extraction_failed",
//           message: "Unable to extract high-quality formats",
//           platform: detectPlatform(url),
//         },
//         { status: 422 }
//       );
//     }
//   } catch (error: any) {
//     console.error("💀 Fatal error:", error.message);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "internal_error",
//       },
//       { status: 500 }
//     );
//   }
// }

// // 🔧 ENHANCED FORMAT EXTRACTION (All Qualities)
// function extractAllQualityFormats(formats: any[]) {
//   if (!Array.isArray(formats) || formats.length === 0) return [];

//   const uniqueMap = new Map();
//   const processed: any[] = [];

//   // Sort by quality first (highest to lowest)
//   const sortedFormats = formats.sort((a, b) => {
//     const aHeight = a.height || 0;
//     const bHeight = b.height || 0;
//     if (aHeight !== bHeight) return bHeight - aHeight;
//     return (b.tbr || 0) - (a.tbr || 0);
//   });

//   for (const format of sortedFormats) {
//     if (!format || !format.format_id) continue;

//     // Skip MHTML and other low-quality formats unless no better option
//     if (format.ext === "mhtml" && processed.length > 0) continue;
//     if (format.protocol === "m3u8_native" && processed.length > 3) continue;

//     // Create comprehensive unique key
//     const quality = getQualityLabel(format);
//     const resolution = getResolution(format);
//     const type = getFormatType(format);
//     const uniqueKey = `${quality}_${resolution}_${type}_${format.ext || "mp4"}`;

//     // Skip exact duplicates
//     if (uniqueMap.has(uniqueKey)) continue;
//     uniqueMap.set(uniqueKey, true);

//     const processedFormat = {
//       format_id: format.format_id,
//       ext: format.ext || "mp4",
//       quality: quality,
//       resolution: resolution,
//       filesize: getFileSize(format.filesize || format.filesize_approx),
//       vcodec: format.vcodec === "none" ? null : format.vcodec || "h264",
//       acodec: format.acodec === "none" ? null : format.acodec || "aac",
//       fps: format.fps || null,
//       tbr: Math.round(format.tbr || 0),
//       vbr: Math.round(format.vbr || 0),
//       abr: Math.round(format.abr || 0),
//       type: type,
//       note: format.format_note || "",
//       protocol: format.protocol || "https",
//       height: format.height || null,
//       width: format.width || null,
//       is_premium:
//         format.format_note?.toLowerCase().includes("premium") || false,
//     };

//     processed.push(processedFormat);
//   }

//   // Return top 20 formats (including all qualities from 4K to 144p)
//   return processed.slice(0, 20);
// }

// // 🔧 FORMAT LIST PARSER (Fallback Method)
// function parseFormatList(listOutput: string) {
//   const lines = listOutput.split("\n");
//   const formats: any[] = [];

//   for (const line of lines) {
//     if (line.includes("mp4") || line.includes("webm") || line.includes("m4a")) {
//       const parts = line.trim().split(/\s+/);
//       if (parts.length >= 3) {
//         const formatId = parts[0];
//         const ext = parts[1] || "mp4";
//         const quality = parts[2] || "unknown";

//         // Extract resolution if available
//         let resolution = "audio";
//         let height = null;

//         const resMatch = line.match(/(\d+)x(\d+)/);
//         if (resMatch) {
//           resolution = `${resMatch[1]}x${resMatch[2]}`;
//           height = parseInt(resMatch[2]);
//         } else {
//           const heightMatch = line.match(/(\d+)p/);
//           if (heightMatch) {
//             height = parseInt(heightMatch[1]);
//             resolution = `${Math.round((height * 16) / 9)}x${height}`;
//           }
//         }

//         formats.push({
//           format_id: formatId,
//           ext: ext,
//           quality: height ? `${height}p` : quality,
//           resolution: resolution,
//           filesize: "unknown",
//           vcodec: ext === "m4a" ? null : "h264",
//           acodec: line.includes("video only") ? null : "aac",
//           fps: null,
//           tbr: 0,
//           type: getFormatTypeFromExt(ext, line),
//           note: "",
//           protocol: "https",
//           height: height,
//         });
//       }
//     }
//   }

//   // Sort by height (quality) descending
//   return formats.sort((a, b) => (b.height || 0) - (a.height || 0));
// }

// // 🛠️ HELPER FUNCTIONS
// function getFormatTypeFromExt(ext: string, line: string): string {
//   if (ext === "m4a" || line.includes("audio only")) return "audio";
//   if (line.includes("video only")) return "video";
//   return "video+audio";
// }

// function getQualityLabel(format: any): string {
//   if (format.height) {
//     // Map common YouTube qualities
//     if (format.height >= 2160) return "4K";
//     if (format.height >= 1440) return "1440p";
//     if (format.height >= 1080) return "1080p";
//     if (format.height >= 720) return "720p";
//     if (format.height >= 480) return "480p";
//     if (format.height >= 360) return "360p";
//     return `${format.height}p`;
//   }

//   if (format.format_note) {
//     const note = format.format_note.toLowerCase();
//     if (note.includes("4k") || note.includes("2160p")) return "4K";
//     if (note.includes("1440p")) return "1440p";
//     if (note.includes("1080p")) return "1080p";
//     if (note.includes("720p")) return "720p";
//     if (note.includes("480p")) return "480p";
//     if (note.includes("360p")) return "360p";
//     if (note.includes("audio")) return format.format_note;
//     return format.format_note;
//   }

//   if (format.abr) return `${format.abr}kbps`;
//   return "default";
// }

// function getResolution(format: any): string {
//   if (format.height && format.width) return `${format.width}x${format.height}`;
//   if (format.height)
//     return `${Math.round((format.height * 16) / 9)}x${format.height}`;
//   return "audio";
// }

// function getFileSize(size: number | null): string {
//   if (!size || size <= 0) return "unknown";
//   const gb = size / (1024 * 1024 * 1024);
//   const mb = size / (1024 * 1024);
//   if (gb >= 1) return `${gb.toFixed(1)}GB`;
//   if (mb >= 1) return `${mb.toFixed(1)}MB`;
//   return `${(size / 1024).toFixed(0)}KB`;
// }

// function getFormatType(format: any): string {
//   const hasVideo = format.vcodec && format.vcodec !== "none";
//   const hasAudio = format.acodec && format.acodec !== "none";

//   if (hasVideo && hasAudio) return "video+audio";
//   if (hasVideo) return "video";
//   if (hasAudio) return "audio";
//   return "unknown";
// }

// function detectPlatform(url: string): string {
//   if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
//   if (url.includes("instagram.com")) return "instagram";
//   if (url.includes("tiktok.com")) return "tiktok";
//   if (url.includes("facebook.com")) return "facebook";
//   return "generic";
// }

// function formatDuration(seconds: number | null): string {
//   if (!seconds) return "";
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);

//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   }
//   return `${minutes}:${secs.toString().padStart(2, "0")}`;
// }

// function formatNumber(num: number | null): string {
//   if (!num) return "";
//   if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
//   if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
//   if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
//   return num.toLocaleString();
// }

// function getBestThumbnail(data: any): string {
//   if (data.thumbnail) return data.thumbnail;
//   if (data.thumbnails && Array.isArray(data.thumbnails)) {
//     const best = data.thumbnails
//       .filter((t) => t && t.url)
//       .sort(
//         (a, b) =>
//           (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
//       )[0];
//     return best?.url || "";
//   }
//   return "";
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
//       return NextResponse.json(
//         { success: false, error: "URL parameter required" },
//         { status: 400 }
//       );
//     }

//     const platform = detectPlatform(url);
//     console.log(`🎯 Processing ${platform} formats:`, url);

//     // 🔥 ANTI-DETECTION HEADERS & USER AGENTS
//     const userAgents = [
//       "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
//       "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     ];
//     const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

//     // 🎬 PLATFORM-SPECIFIC OPTIMIZATIONS
//     let command = buildPlatformCommand(platform, url, randomUA);

//     try {
//       const { stdout: jsonOutput } = await execAsync(command, {
//         timeout: 30000, // Extended timeout
//         maxBuffer: 1024 * 1024 * 20, // 20MB buffer
//       });

//       if (!jsonOutput || jsonOutput.trim() === "") {
//         throw new Error("Empty response from extractor");
//       }

//       const videoInfo = JSON.parse(jsonOutput.trim());
//       const allFormats = extractOptimizedFormats(
//         videoInfo.formats || [],
//         platform
//       );

//       return NextResponse.json(
//         {
//           success: true,
//           title: videoInfo.title || "Unknown Title",
//           duration: formatDuration(videoInfo.duration),
//           thumbnail: getBestThumbnail(videoInfo),
//           uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
//           view_count: formatNumber(videoInfo.view_count),
//           platform: platform,
//           formats: allFormats,
//           total_formats: allFormats.length,
//           extracted_at: Date.now(),
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             "Cache-Control": "public, max-age=300", // 5 min cache
//           },
//         }
//       );
//     } catch (execError: any) {
//       console.error(`💥 ${platform} extraction failed:`, execError.message);

//       // 🔄 FALLBACK STRATEGY
//       const fallbackResult = await attemptFallbackExtraction(
//         url,
//         platform,
//         randomUA
//       );
//       if (fallbackResult.success) {
//         return NextResponse.json(fallbackResult);
//       }

//       return NextResponse.json(
//         {
//           success: false,
//           error: "extraction_failed",
//           message: `${platform} format extraction failed. Try again in few seconds.`,
//           platform: platform,
//         },
//         { status: 422 }
//       );
//     }
//   } catch (error: any) {
//     console.error("💀 Fatal error:", error.message);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "internal_error",
//       },
//       { status: 500 }
//     );
//   }
// }

// // 🔧 PLATFORM-SPECIFIC COMMAND BUILDER
// function buildPlatformCommand(
//   platform: string,
//   url: string,
//   userAgent: string
// ): string {
//   let command = `yt-dlp --dump-single-json --no-warnings --ignore-errors`;

//   // Base settings for all platforms
//   command += ` --socket-timeout 30 --retries 3 --fragment-retries 3`;
//   command += ` --user-agent "${userAgent}"`;

//   switch (platform) {
//     case "instagram":
//       // 🔥 INSTAGRAM ANTI-DETECTION
//       command += ` --add-header "X-Instagram-AJAX:1"`;
//       command += ` --add-header "X-Requested-With:XMLHttpRequest"`;
//       command += ` --add-header "Accept:*/*"`;
//       command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
//       command += ` --add-header "Sec-Fetch-Dest:empty"`;
//       command += ` --add-header "Sec-Fetch-Mode:cors"`;
//       command += ` --extractor-args "instagram:api_version=v1"`;
//       break;

//     case "facebook":
//       // 🔥 FACEBOOK OPTIMIZATION
//       command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
//       command += ` --add-header "Referer:https://www.facebook.com/"`;
//       command += ` --add-header "Sec-Fetch-Dest:video"`;
//       command += ` --add-header "Sec-Fetch-Mode:no-cors"`;
//       // Try mobile version for better access
//       if (url.includes("facebook.com")) {
//         url = url.replace("www.facebook.com", "m.facebook.com");
//       }
//       break;

//     case "youtube":
//       // 🔥 YOUTUBE MULTI-CLIENT BYPASS
//       command += ` --extractor-args "youtube:player_client=android,ios,web"`;
//       command += ` --extractor-args "youtube:player_skip=configs,webpage"`;
//       command += ` --extractor-args "youtube:skip=dash,hls"`;
//       // Additional bypass for age restrictions
//       command += ` --extractor-args "youtube:innertube_host=youtubei.googleapis.com"`;
//       break;

//     case "tiktok":
//       // 🔥 TIKTOK ANTI-BOT
//       command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
//       command += ` --add-header "Accept-Encoding:gzip, deflate"`;
//       command += ` --add-header "DNT:1"`;
//       command += ` --add-header "Connection:keep-alive"`;
//       command += ` --sleep-interval 2 --max-sleep-interval 5`;
//       break;
//   }

//   command += ` --geo-bypass "${url}"`;
//   return command;
// }

// // 🔧 OPTIMIZED FORMAT EXTRACTOR
// function extractOptimizedFormats(formats: any[], platform: string) {
//   if (!Array.isArray(formats) || formats.length === 0) return [];

//   const uniqueMap = new Map();
//   const processed: any[] = [];

//   // Platform-specific sorting priorities
//   const sortedFormats = formats.sort((a, b) => {
//     if (platform === "instagram" || platform === "facebook") {
//       // Prioritize direct MP4 formats
//       if (a.ext === "mp4" && b.ext !== "mp4") return -1;
//       if (b.ext === "mp4" && a.ext !== "mp4") return 1;
//     }

//     const aHeight = a.height || 0;
//     const bHeight = b.height || 0;
//     if (aHeight !== bHeight) return bHeight - aHeight;
//     return (b.tbr || 0) - (a.tbr || 0);
//   });

//   for (const format of sortedFormats) {
//     if (!format || !format.format_id) continue;

//     // Skip problematic formats
//     if (shouldSkipFormat(format, platform)) continue;

//     const quality = getQualityLabel(format);
//     const resolution = getResolution(format);
//     const type = getFormatType(format);
//     const uniqueKey = `${quality}_${resolution}_${type}_${format.ext || "mp4"}`;

//     if (uniqueMap.has(uniqueKey)) continue;
//     uniqueMap.set(uniqueKey, true);

//     const processedFormat = {
//       format_id: format.format_id,
//       ext: format.ext || "mp4",
//       quality: quality,
//       resolution: resolution,
//       filesize: getFileSize(format.filesize || format.filesize_approx),
//       vcodec: format.vcodec === "none" ? null : format.vcodec || "h264",
//       acodec: format.acodec === "none" ? null : format.acodec || "aac",
//       fps: format.fps || null,
//       tbr: Math.round(format.tbr || 0),
//       vbr: Math.round(format.vbr || 0),
//       abr: Math.round(format.abr || 0),
//       type: type,
//       note: format.format_note || "",
//       protocol: format.protocol || "https",
//       height: format.height || null,
//       width: format.width || null,
//       url: format.url || null, // Important for direct access
//     };

//     processed.push(processedFormat);
//   }

//   return processed.slice(0, 30); // Return top 30 formats
// }

// // 🔄 FALLBACK EXTRACTION
// async function attemptFallbackExtraction(
//   url: string,
//   platform: string,
//   userAgent: string
// ) {
//   try {
//     // Try with format listing approach
//     const listCommand = `yt-dlp --list-formats --no-warnings --user-agent "${userAgent}" "${url}"`;
//     const { stdout: listOutput } = await execAsync(listCommand, {
//       timeout: 20000,
//       maxBuffer: 1024 * 1024 * 10,
//     });

//     if (listOutput) {
//       const parsedFormats = parseFormatListAdvanced(listOutput, platform);
//       if (parsedFormats.length > 0) {
//         return {
//           success: true,
//           title: "Video",
//           duration: "",
//           thumbnail: "",
//           uploader: "Unknown",
//           platform: platform,
//           formats: parsedFormats,
//           total_formats: parsedFormats.length,
//           extraction_method: "fallback-list",
//           extracted_at: Date.now(),
//         };
//       }
//     }
//   } catch (error) {
//     console.log(`Fallback also failed for ${platform}`);
//   }

//   return { success: false };
// }

// function shouldSkipFormat(format: any, platform: string): boolean {
//   // Skip MHTML and very low quality formats
//   if (format.ext === "mhtml") return true;
//   if (format.protocol === "m3u8_native" && format.tbr && format.tbr < 100)
//     return true;

//   // Platform specific skips
//   if (platform === "instagram" || platform === "facebook") {
//     // Skip formats without direct URLs for social media
//     if (!format.url && !format.fragment_base_url) return true;
//   }

//   return false;
// }

// // ... (Other helper functions remain same but optimized)
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

// function getQualityLabel(format: any): string {
//   if (format.height) {
//     if (format.height >= 2160) return "4K";
//     if (format.height >= 1440) return "1440p";
//     if (format.height >= 1080) return "1080p";
//     if (format.height >= 720) return "720p";
//     if (format.height >= 480) return "480p";
//     if (format.height >= 360) return "360p";
//     return `${format.height}p`;
//   }
//   if (format.format_note) return format.format_note;
//   if (format.abr) return `${format.abr}kbps`;
//   return "default";
// }

// function getResolution(format: any): string {
//   if (format.height && format.width) return `${format.width}x${format.height}`;
//   if (format.height)
//     return `${Math.round((format.height * 16) / 9)}x${format.height}`;
//   return "audio";
// }

// function getFileSize(size: number | null): string {
//   if (!size || size <= 0) return "unknown";
//   const gb = size / (1024 * 1024 * 1024);
//   const mb = size / (1024 * 1024);
//   if (gb >= 1) return `${gb.toFixed(1)}GB`;
//   if (mb >= 1) return `${mb.toFixed(1)}MB`;
//   return `${(size / 1024).toFixed(0)}KB`;
// }

// function getFormatType(format: any): string {
//   const hasVideo = format.vcodec && format.vcodec !== "none";
//   const hasAudio = format.acodec && format.acodec !== "none";
//   if (hasVideo && hasAudio) return "video+audio";
//   if (hasVideo) return "video";
//   if (hasAudio) return "audio";
//   return "unknown";
// }

// function formatDuration(seconds: number | null): string {
//   if (!seconds) return "";
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);
//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   }
//   return `${minutes}:${secs.toString().padStart(2, "0")}`;
// }

// function formatNumber(num: number | null): string {
//   if (!num) return "";
//   if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
//   if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
//   if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
//   return num.toLocaleString();
// }

// function getBestThumbnail(data: any): string {
//   if (data.thumbnail) return data.thumbnail;
//   if (data.thumbnails && Array.isArray(data.thumbnails)) {
//     const best = data.thumbnails
//       .filter((t) => t && t.url)
//       .sort(
//         (a, b) =>
//           (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
//       )[0];
//     return best?.url || "";
//   }
//   return "";
// }

// function parseFormatListAdvanced(listOutput: string, platform: string) {
//   const lines = listOutput.split("\n");
//   const formats: any[] = [];

//   for (const line of lines) {
//     if (line.includes("mp4") || line.includes("webm") || line.includes("m4a")) {
//       const parts = line.trim().split(/\s+/);
//       if (parts.length >= 3) {
//         const formatId = parts[0];
//         const ext = parts[1] || "mp4";
//         const quality = parts[2] || "unknown";

//         let resolution = "audio";
//         let height = null;

//         const resMatch = line.match(/(\d+)x(\d+)/);
//         if (resMatch) {
//           resolution = `${resMatch[1]}x${resMatch[2]}`;
//           height = parseInt(resMatch[2]);
//         } else {
//           const heightMatch = line.match(/(\d+)p/);
//           if (heightMatch) {
//             height = parseInt(heightMatch[1]);
//             resolution = `${Math.round((height * 16) / 9)}x${height}`;
//           }
//         }

//         formats.push({
//           format_id: formatId,
//           ext: ext,
//           quality: height ? `${height}p` : quality,
//           resolution: resolution,
//           filesize: "unknown",
//           vcodec: ext === "m4a" ? null : "h264",
//           acodec: line.includes("video only") ? null : "aac",
//           fps: null,
//           tbr: 0,
//           type: getFormatTypeFromExt(ext, line),
//           note: "",
//           protocol: "https",
//           height: height,
//         });
//       }
//     }
//   }

//   return formats.sort((a, b) => (b.height || 0) - (a.height || 0));
// }

// function getFormatTypeFromExt(ext: string, line: string): string {
//   if (ext === "m4a" || line.includes("audio only")) return "audio";
//   if (line.includes("video only")) return "video";
//   return "video+audio";
// }


import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 🌐 TYPE DEFINITIONS
interface IPPools {
  [key: string]: string[];
}

interface RequestCounts {
  [key: string]: number;
}

interface LastRotations {
  [key: string]: number;
}

interface MaxRequestsPerIP {
  [key: string]: number;
}

interface RotationIntervals {
  [key: string]: number;
}

interface FailedIPs {
  [key: string]: Set<string>;
}

interface ProcessedFormat {
  format_id: string;
  ext: string;
  quality: string;
  resolution: string;
  filesize: string;
  vcodec: string | null;
  acodec: string | null;
  fps: number | null;
  tbr: number;
  vbr: number;
  abr: number;
  type: string;
  note: string;
  protocol: string;
  height: number | null;
  width: number | null;
  language: string | null;
  dynamic_range: string | null;
}

interface VideoInfo {
  title?: string;
  duration?: number;
  thumbnail?: string;
  uploader?: string;
  channel?: string;
  view_count?: number;
  formats?: any[];
  thumbnails?: any[];
}

interface IPStats {
  platform: string;
  normalizedPlatform: string;
  currentIP: string;
  requestCount: number;
  maxRequests: number;  
  failedIPs: number;
  totalIPs: number;
  workingIPs: number;
}

// 🌐 COMPLETE IP ROTATION SYSTEM FOR ALL PLATFORMS
class UniversalIPRotationManager {
  private ipPools: IPPools;
  private currentIndexes: RequestCounts;
  private requestCounts: RequestCounts;
  private lastRotations: LastRotations;
  private maxRequestsPerIP: MaxRequestsPerIP;
  private rotationIntervals: RotationIntervals;
  private failedIPs: FailedIPs;

  constructor() {
    this.ipPools = {
      youtube: [
        "197.39.58.214", "3.58.167.48", "182.106.71.140", "185.162.231.106", 
        "198.59.191.234", "103.207.8.130", "45.195.67.75", "103.216.207.15",
        "178.128.51.12", "103.52.211.194"
      ],
      instagram: [
        "103.174.179.31", "202.61.51.204", "41.65.174.120", "103.127.1.130",
        "185.162.231.106", "198.59.191.234", "45.195.67.75", "103.216.207.15",
        "178.128.51.12", "194.67.91.153"
      ],
      facebook: [
        "103.245.204.214", "202.169.229.139", "103.145.133.22", "194.67.91.153",
        "185.162.231.106", "103.174.179.31", "198.59.191.234", "41.65.174.120",
        "103.127.1.130", "45.195.67.75"
      ],
      tiktok: [
        "178.128.51.12", "103.52.211.194", "194.67.91.153", "103.207.8.130",
        "185.162.231.106", "202.61.51.204", "41.65.174.120", "103.127.1.130",
        "103.216.207.15", "198.59.191.234"
      ],
      generic: [
        "103.174.179.31", "202.61.51.204", "41.65.174.120", "103.127.1.130", 
        "185.162.231.106", "198.59.191.234", "45.195.67.75", "103.216.207.15",
        "178.128.51.12", "103.52.211.194", "194.67.91.153", "103.207.8.130",
        "103.245.204.214", "202.169.229.139", "103.145.133.22"
      ]
    };
    
    this.currentIndexes = {
      youtube: 0, instagram: 0, facebook: 0, tiktok: 0, generic: 0
    };
    
    this.requestCounts = {
      youtube: 0, instagram: 0, facebook: 0, tiktok: 0, generic: 0
    };
    
    this.lastRotations = {
      youtube: Date.now(), instagram: Date.now(), facebook: Date.now(), 
      tiktok: Date.now(), generic: Date.now()
    };
    
    this.maxRequestsPerIP = {
      youtube: 8, instagram: 12, facebook: 10, tiktok: 6, generic: 15
    };
    
    this.rotationIntervals = {
      youtube: 45 * 60 * 1000, instagram: 30 * 60 * 1000, facebook: 35 * 60 * 1000,
      tiktok: 25 * 60 * 1000, generic: 40 * 60 * 1000
    };
    
    this.failedIPs = {
      youtube: new Set<string>(), instagram: new Set<string>(), facebook: new Set<string>(), 
      tiktok: new Set<string>(), generic: new Set<string>()
    };
    
    console.log("🌐 List-Formats Universal IP Rotation Manager initialized");
  }

  getCurrentIP(platform: string): string {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    const pool = this.ipPools[normalizedPlatform];
    const failedSet = this.failedIPs[normalizedPlatform];
    
    const workingIPs = pool.filter(ip => !failedSet.has(ip));
    
    if (workingIPs.length === 0) {
      console.log(`🔄 All ${normalizedPlatform} IPs failed, resetting...`);
      failedSet.clear();
      this.currentIndexes[normalizedPlatform] = 0;
      return pool[0];
    }
    
    const currentIndex = this.currentIndexes[normalizedPlatform] % workingIPs.length;
    const selectedIP = workingIPs[currentIndex];
    
    this.currentIndexes[normalizedPlatform]++;
    
    return selectedIP;
  }

  shouldRotateIP(platform: string): boolean {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    const now = Date.now();
    const timeSinceRotation = now - this.lastRotations[normalizedPlatform];
    const requestCount = this.requestCounts[normalizedPlatform];
    const maxRequests = this.maxRequestsPerIP[normalizedPlatform];
    const rotationInterval = this.rotationIntervals[normalizedPlatform];
    
    return timeSinceRotation > rotationInterval || requestCount >= maxRequests;
  }

  rotateIP(platform: string): void {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    this.requestCounts[normalizedPlatform] = 0;
    this.lastRotations[normalizedPlatform] = Date.now();
    this.currentIndexes[normalizedPlatform] = (this.currentIndexes[normalizedPlatform] + 1) % this.ipPools[normalizedPlatform].length;
    
    const newIP = this.getCurrentIP(platform);
    console.log(`🔄 ${platform.toUpperCase()} IP rotated to: ${newIP}`);
  }

  recordRequest(platform: string): void {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    this.requestCounts[normalizedPlatform]++;
    const currentIP = this.getCurrentIP(platform);
    console.log(`📊 ${platform.toUpperCase()} Request ${this.requestCounts[normalizedPlatform]}/${this.maxRequestsPerIP[normalizedPlatform]} for IP: ${currentIP}`);
  }

  recordIPFailure(platform: string, ip: string): void {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    if (ip && this.failedIPs[normalizedPlatform]) {
      this.failedIPs[normalizedPlatform].add(ip);
      console.log(`❌ Marked ${platform} IP as failed: ${ip}`);
    }
  }

  recordIPSuccess(platform: string, ip: string): void {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    if (ip && this.failedIPs[normalizedPlatform] && this.failedIPs[normalizedPlatform].has(ip)) {
      this.failedIPs[normalizedPlatform].delete(ip);
      console.log(`✅ ${platform} IP recovered: ${ip}`);
    }
  }

  getStats(platform: string): IPStats {
    const normalizedPlatform = platform in this.ipPools ? platform : 'generic';
    return {
      platform: platform,
      normalizedPlatform: normalizedPlatform,
      currentIP: this.getCurrentIP(platform),
      requestCount: this.requestCounts[normalizedPlatform],
      maxRequests: this.maxRequestsPerIP[normalizedPlatform],
      failedIPs: this.failedIPs[normalizedPlatform].size,
      totalIPs: this.ipPools[normalizedPlatform].length,
      workingIPs: this.ipPools[normalizedPlatform].length - this.failedIPs[normalizedPlatform].size
    };
  }
}

// 🌐 GLOBAL IP MANAGER
const listFormatsIPManager = new UniversalIPRotationManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL parameter required" },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);
    console.log(`🎯 Processing ${platform} formats:`, url);

    // 🔄 IP ROTATION CHECK
    if (listFormatsIPManager.shouldRotateIP(platform)) {
      listFormatsIPManager.rotateIP(platform);
      
      const rotationDelays: { [key: string]: number } = {
        youtube: 5000, instagram: 3000, facebook: 4000, tiktok: 6000, generic: 2000
      };
      
      const delay = rotationDelays[platform] || rotationDelays.generic;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    listFormatsIPManager.recordRequest(platform);

    const currentIP = listFormatsIPManager.getCurrentIP(platform);
    console.log(`🌐 Using IP for ${platform} formats: ${currentIP}`);

    const command = buildPlatformCommandWithIP(platform, url, currentIP);

    try {
      const { stdout: jsonOutput } = await execAsync(command, {
        timeout: 45000,
        maxBuffer: 1024 * 1024 * 30,
      });

      if (!jsonOutput || jsonOutput.trim() === "") {
        throw new Error("Empty response from extractor");
      }

      const videoInfo: VideoInfo = JSON.parse(jsonOutput.trim());
      const allFormats = extractOptimizedFormatsWithDuplicateCheck(videoInfo.formats || [], platform);

      console.log(`✅ ${platform} formats extracted successfully with IP: ${currentIP} | Total: ${allFormats.length}`);
      
      listFormatsIPManager.recordIPSuccess(platform, currentIP);

      return NextResponse.json({
        success: true,
        title: videoInfo.title || "Unknown Title",
        duration: formatDuration(videoInfo.duration || null),
        thumbnail: getBestThumbnail(videoInfo),
        uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
        view_count: formatNumber(videoInfo.view_count || null),
        platform: platform,
        formats: allFormats,
        total_formats: allFormats.length,
        extracted_at: Date.now(),
        ip_stats: listFormatsIPManager.getStats(platform)
      }, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      });

    } catch (execError: any) {
      console.error(`💥 ${platform} extraction failed with IP ${currentIP}:`, execError.message);
      
      const errorMessage = execError.message.toLowerCase();
      if (errorMessage.includes('sign in') || errorMessage.includes('bot') || 
          errorMessage.includes('rate-limit') || errorMessage.includes('login')) {
        listFormatsIPManager.recordIPFailure(platform, currentIP);
      }

      const fallbackResult = await attemptIPRotationFallback(url, platform);
      if (fallbackResult.success) {
        return NextResponse.json(fallbackResult);
      }

      return NextResponse.json({
        success: false,
        error: "extraction_failed",
        message: `${platform} format extraction failed. IP rotation in progress - try again.`,
        platform: platform,
        ip_stats: listFormatsIPManager.getStats(platform)
      }, { status: 422 });
    }
    
  } catch (error: any) {
    console.error("💀 Fatal error:", error.message);
    return NextResponse.json({
      success: false,
      error: "internal_error",
      message: error.message
    }, { status: 500 });
  }
}

function buildPlatformCommandWithIP(platform: string, url: string, currentIP: string): string {
  let command = `yt-dlp --dump-single-json --no-warnings --ignore-errors`;

  command += ` --add-header "X-Forwarded-For:${currentIP}"`;
  command += ` --add-header "CF-Connecting-IP:${currentIP}"`;
  command += ` --add-header "X-Real-IP:${currentIP}"`;
  command += ` --add-header "X-Originating-IP:${currentIP}"`;

  command += ` --socket-timeout 180 --retries 15 --fragment-retries 12`;
  command += ` --sleep-interval 4 --max-sleep-interval 15`;
  command += ` --no-check-certificate --no-call-home`;

  switch (platform) {
    case "youtube":
      command += ` --extractor-args "youtube:player_client=web_embedded,android_creator,ios_music"`;
      command += ` --extractor-args "youtube:player_skip=dash,hls,configs,webpage"`;
      command += ` --extractor-args "youtube:skip=translated_subs,dash,hls"`;
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.5"`;
      break;

    case "instagram":
      command += ` --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"`;
      command += ` --add-header "X-Instagram-AJAX:1"`;
      command += ` --add-header "X-Requested-With:XMLHttpRequest"`;
      command += ` --add-header "Accept:*/*"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --add-header "Sec-Fetch-Dest:empty"`;
      command += ` --add-header "Sec-Fetch-Mode:cors"`;
      command += ` --add-header "Referer:https://www.instagram.com/"`;
      break;

    case "facebook":
      command += ` --user-agent "Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --add-header "Referer:https://www.facebook.com/"`;
      command += ` --add-header "Sec-Fetch-Dest:video"`;
      command += ` --add-header "Sec-Fetch-Mode:no-cors"`;
      command += ` --add-header "DNT:1"`;
      break;

    case "tiktok":
      command += ` --user-agent "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --add-header "DNT:1"`;
      command += ` --add-header "Connection:keep-alive"`;
      command += ` --geo-bypass`;
      break;

    default:
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.5"`;
      command += ` --add-header "DNT:1"`;
      command += ` --geo-bypass`;
      break;
  }

  command += ` "${url}"`;
  return command;
}

async function attemptIPRotationFallback(url: string, platform: string) {
  try {
    listFormatsIPManager.rotateIP(platform);
    const fallbackIP = listFormatsIPManager.getCurrentIP(platform);
    
    console.log(`🔄 Attempting fallback with fresh IP: ${fallbackIP}`);
    
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    const fallbackCommand = buildPlatformCommandWithIP(platform, url, fallbackIP);
    const { stdout: fallbackOutput } = await execAsync(fallbackCommand, {
      timeout: 35000,
      maxBuffer: 1024 * 1024 * 25,
    });

    if (fallbackOutput && fallbackOutput.trim()) {
      const videoInfo: VideoInfo = JSON.parse(fallbackOutput.trim());
      const formats = extractOptimizedFormatsWithDuplicateCheck(videoInfo.formats || [], platform);
      
      console.log(`✅ Fallback successful with IP: ${fallbackIP} | Total: ${formats.length}`);
      
      listFormatsIPManager.recordIPSuccess(platform, fallbackIP);
      
      return {
        success: true,
        title: videoInfo.title || "Video",
        duration: formatDuration(videoInfo.duration || null),
        thumbnail: getBestThumbnail(videoInfo),
        uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
        view_count: formatNumber(videoInfo.view_count || null),
        platform: platform,
        formats: formats,
        total_formats: formats.length,
        extraction_method: "ip-rotation-fallback",
        ip_stats: listFormatsIPManager.getStats(platform),
        extracted_at: Date.now(),
      };
    }
  } catch (error: any) {
    console.log(`❌ IP rotation fallback also failed for ${platform}:`, error.message);
  }

  return { success: false };
}

function extractOptimizedFormatsWithDuplicateCheck(formats: any[], platform: string): ProcessedFormat[] {
  if (!Array.isArray(formats) || formats.length === 0) return [];

  const uniqueMap = new Map<string, boolean>();
  const seenCombinations = new Set<string>();
  const processed: ProcessedFormat[] = [];

  const sortedFormats = formats.sort((a: any, b: any) => {
    if (platform === "instagram" || platform === "facebook") {
      if (a.ext === "mp4" && b.ext !== "mp4") return -1;
      if (b.ext === "mp4" && a.ext !== "mp4") return 1;
    }

    const aHeight = a.height || 0;
    const bHeight = b.height || 0;
    if (aHeight !== bHeight) return bHeight - aHeight;
    
    return (b.tbr || b.vbr || 0) - (a.tbr || a.vbr || 0);
  });

  for (const format of sortedFormats) {
    if (!format || !format.format_id) continue;

    if (shouldSkipFormat(format, platform)) continue;

    const quality = getQualityLabel(format);
    const resolution = getResolution(format);
    const type = getFormatType(format);
    const ext = format.ext || "mp4";
    const vcodec = format.vcodec === "none" ? null : (format.vcodec || "h264");
    const acodec = format.acodec === "none" ? null : (format.acodec || "aac");
    
    if (uniqueMap.has(format.format_id)) continue;
    
    const basicKey = `${quality}_${resolution}_${type}_${ext}`;
    if (seenCombinations.has(basicKey)) continue;
    
    const advancedKey = `${quality}_${resolution}_${type}_${ext}_${vcodec}_${acodec}`;
    if (seenCombinations.has(advancedKey)) continue;
    
    if (format.height && format.width) {
      const dimensionKey = `${format.height}x${format.width}_${ext}_${type}`;
      if (seenCombinations.has(dimensionKey)) continue;
      seenCombinations.add(dimensionKey);
    }
    
    const formatBitrate = format.tbr || format.vbr || format.abr || 0;
    if (formatBitrate > 0) {
      const bitrateKey = `${quality}_${Math.floor(formatBitrate / 50) * 50}_${type}`;
      if (seenCombinations.has(bitrateKey)) continue;
      seenCombinations.add(bitrateKey);
    }

    uniqueMap.set(format.format_id, true);
    seenCombinations.add(basicKey);
    seenCombinations.add(advancedKey);

    const processedFormat: ProcessedFormat = {
      format_id: format.format_id,
      ext: ext,
      quality: quality,
      resolution: resolution,
      filesize: getFileSize(format.filesize || format.filesize_approx),
      vcodec: vcodec,
      acodec: acodec,
      fps: format.fps || null,
      tbr: Math.round(format.tbr || 0),
      vbr: Math.round(format.vbr || 0),
      abr: Math.round(format.abr || 0),
      type: type,
      note: format.format_note || "",
      protocol: format.protocol || "https",
      height: format.height || null,
      width: format.width || null,
      language: format.language || null,
      dynamic_range: format.dynamic_range || null
    };

    processed.push(processedFormat);

    if (processed.length >= 25) break;
  }

  console.log(`🔍 Format extraction: ${formats.length} raw → ${processed.length} unique`);
  return processed;
}

function detectPlatform(url: string): string {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes("instagram.com")) return "instagram";
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) return "youtube";
  if (cleanUrl.includes("tiktok.com")) return "tiktok";
  if (cleanUrl.includes("facebook.com") || cleanUrl.includes("fb.watch")) return "facebook";
  return "generic";
}

function shouldSkipFormat(format: any, platform: string): boolean {
  if (format.ext === "mhtml") return true;
  if (format.protocol === "m3u8_native" && format.tbr && format.tbr < 50) return true;
  if ((platform === "instagram" || platform === "facebook") && 
      !format.url && !format.fragment_base_url) return true;
  if (format.vcodec === "none" && format.abr && format.abr < 32) return true;
  if (format.height && format.height < 144) return true;
  return false;
}

function getQualityLabel(format: any): string {
  if (format.height) {
    if (format.height >= 2160) return "4K";
    if (format.height >= 1440) return "1440p";
    if (format.height >= 1080) return "1080p";
    if (format.height >= 720) return "720p";
    if (format.height >= 480) return "480p";
    if (format.height >= 360) return "360p";
    if (format.height >= 240) return "240p";
    return `${format.height}p`;
  }
  if (format.format_note && format.format_note !== "Default") return format.format_note;
  if (format.abr && format.vcodec === "none") return `${format.abr}kbps`;
  if (format.tbr) return `${Math.round(format.tbr)}kbps`;
  return "default";
}

function getResolution(format: any): string {
  if (format.height && format.width) return `${format.width}x${format.height}`;
  if (format.height) return `${Math.round((format.height * 16) / 9)}x${format.height}`;
  if (format.width) return `${format.width}x${Math.round((format.width * 9) / 16)}`;
  return "audio";
}

function getFileSize(size: number | null | undefined): string {
  if (!size || size <= 0) return "unknown";
  const gb = size / (1024 * 1024 * 1024);
  const mb = size / (1024 * 1024);
  const kb = size / 1024;
  
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  if (mb >= 1) return `${mb.toFixed(1)}MB`;
  if (kb >= 1) return `${kb.toFixed(0)}KB`;
  return `${size}B`;
}

function getFormatType(format: any): string {
  const hasVideo = format.vcodec && format.vcodec !== "none";
  const hasAudio = format.acodec && format.acodec !== "none";
  
  if (hasVideo && hasAudio) return "video+audio";
  if (hasVideo) return "video";
  if (hasAudio) return "audio";
  return "unknown";
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatNumber(num: number | null): string {
  if (!num || num <= 0) return "";
  
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function getBestThumbnail(data: VideoInfo): string {
  if (data.thumbnail) return data.thumbnail;
  
  if (data.thumbnails && Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
    const validThumbnails = data.thumbnails
      .filter((t: any) => t && t.url && typeof t.url === 'string')
      .sort((a: any, b: any) => {
        const aArea = (a.width || 0) * (a.height || 0);
        const bArea = (b.width || 0) * (b.height || 0);
        return bArea - aArea;
      });
    
    if (validThumbnails.length > 0) {
      return validThumbnails[0].url;
    }
  }
  
  return "";
}
