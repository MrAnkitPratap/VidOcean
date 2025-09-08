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
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("🎥 Fetching formats for:", url);
    
    // 🚀 UPDATED YT-DLP COMMAND BASE
    let command = `yt-dlp -j --no-warnings --no-playlist --ignore-errors --no-call-home --no-check-certificate`;

    // 🎯 PLATFORM-SPECIFIC OPTIMIZATIONS (UPDATED)
    if (url.includes('instagram.com')) {
      console.log("📸 Instagram detected - using enhanced bypass");
      
      // 🔥 INSTAGRAM ENHANCED CONFIGURATION (2024)
      command += ` --user-agent "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.5"`;
      command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;
      command += ` --add-header "DNT:1"`;
      command += ` --add-header "Connection:keep-alive"`;
      command += ` --add-header "Upgrade-Insecure-Requests:1"`;
      command += ` --add-header "Sec-Fetch-Dest:document"`;
      command += ` --add-header "Sec-Fetch-Mode:navigate"`;
      command += ` --add-header "Sec-Fetch-Site:none"`;
      command += ` --add-header "Sec-GPC:1"`;
      command += ` --add-header "Referer:https://www.instagram.com/"`;
      
      // Enhanced stealth settings
      command += ` --extractor-retries 3`;  // Reduced retries
      command += ` --fragment-retries 2`;
      command += ` --socket-timeout 60`;    // Reduced timeout
      command += ` --sleep-interval 5`;     // Shorter intervals
      command += ` --max-sleep-interval 10`;
      command += ` --geo-bypass`;
      
      // Try alternative extraction methods
      command += ` --extractor-args "instagram:api_version=v1,embed=true"`;
      
    } else if (url.includes('tiktok.com')) {
      console.log("🎵 TikTok detected - using API bypass");
      
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;
      command += ` --extractor-retries 3`;
      command += ` --socket-timeout 45`;
      command += ` --sleep-interval 2`;
      command += ` --max-sleep-interval 6`;
      
    } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
      console.log("👥 Facebook detected - using FB optimization");
      
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --extractor-retries 4`;
      command += ` --socket-timeout 90`;
      command += ` --sleep-interval 3`;
      
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log("📺 YouTube detected - using updated extractor");
      
      // 🚀 YOUTUBE FIXED CONFIGURATION (2024-2025)
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --add-header "Accept-Encoding:gzip, deflate, br"`;
      
      // Updated YouTube extractors (fixes player response error)
      command += ` --extractor-args "youtube:player_client=android,web;skip=dash,hls"`;
      command += ` --extractor-args "youtube:player_skip=configs"`;
      
      command += ` --extractor-retries 5`;
      command += ` --fragment-retries 3`;
      command += ` --sleep-interval 1`;
      command += ` --max-sleep-interval 3`;
      command += ` --socket-timeout 45`;
      
    } else {
      console.log("🔗 Generic platform detected");
      
      command += ` --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"`;
      command += ` --add-header "Accept-Language:en-US,en;q=0.9"`;
      command += ` --extractor-retries 3`;
      command += ` --socket-timeout 60`;
      command += ` --sleep-interval 2`;
      command += ` --max-sleep-interval 5`;
    }

    command += ` "${url}"`;
    console.log("🛡️ Executing optimized command...");

    try {
      // 🕒 REDUCED TIMEOUTS (prevents hanging)
      let timeoutMs = 45000; // Default 45 seconds
      if (url.includes('instagram.com')) timeoutMs = 30000;  // 30 seconds
      else if (url.includes('tiktok.com')) timeoutMs = 25000;   // 25 seconds  
      else if (url.includes('facebook.com')) timeoutMs = 60000; // 1 minute
      else if (url.includes('youtube.com')) timeoutMs = 40000;  // 40 seconds
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: timeoutMs,
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer (reduced)
        killSignal: 'SIGKILL', // Force kill on timeout
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONIOENCODING: 'utf-8',
          LANG: 'en_US.UTF-8',
          LC_ALL: 'en_US.UTF-8'
        }
      });

      // 🚨 ENHANCED ERROR HANDLING
      if (stderr && stderr.trim()) {
        console.log("⚠️ yt-dlp stderr:", stderr.substring(0, 300));
        
        // Instagram specific errors
        if (url.includes('instagram.com')) {
          if (stderr.includes("rate-limit") || stderr.includes("login required") || 
              stderr.includes("not available") || stderr.includes("private")) {
            return NextResponse.json({
              success: false,
              error: "Instagram_Access_Limited",
              message: "Instagram content is currently restricted.",
              details: "This happens due to Instagram's anti-bot protection. Try again later or use a different video.",
              platform: "instagram",
              retryAfter: 900, // 15 minutes
              alternatives: [
                "Try a different Instagram video",
                "Wait 15-30 minutes before retrying",
                "Use Instagram's built-in save feature"
              ]
            }, { status: 429 });
          }
        }
        
        // YouTube specific errors
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          if (stderr.includes("Failed to extract any player response") || 
              stderr.includes("Unable to extract") ||
              stderr.includes("Sign in") || 
              stderr.includes("age-restricted")) {
            return NextResponse.json({
              success: false,
              error: "YouTube_Extraction_Failed",
              message: "YouTube video extraction failed.",
              details: "This video may be restricted, private, or YouTube has updated their system.",
              platform: "youtube",
              suggestions: [
                "Try a different YouTube video",
                "Check if the video is public and accessible",
                "Verify the URL is correct"
              ]
            }, { status: 422 });
          }
        }
        
        // TikTok specific errors  
        if (url.includes('tiktok.com')) {
          if (stderr.includes("timed out") || stderr.includes("blocked") || 
              stderr.includes("Connection timeout")) {
            return NextResponse.json({
              success: false,
              error: "TikTok_Blocked",
              message: "TikTok has blocked this request.",
              details: "TikTok actively prevents automated downloads. This is normal behavior.",
              platform: "tiktok",
              alternatives: [
                { name: "SnapTik", url: "snaptik.app" },
                { name: "SaveTT", url: "savett.cc" }
              ]
            }, { status: 408 });
          }
        }
        
        // Generic errors
        if (stderr.includes("HTTP Error 403") || stderr.includes("Forbidden")) {
          return NextResponse.json({
            success: false,
            error: "Access_Denied", 
            message: "Access to this content is restricted.",
            platform: detectPlatform(url)
          }, { status: 403 });
        }
        
        if (stderr.includes("not found") || stderr.includes("Video unavailable") || 
            stderr.includes("Private video")) {
          return NextResponse.json({
            success: false,
            error: "Video_Not_Found",
            message: "The requested video could not be found or is private.",
            platform: detectPlatform(url)
          }, { status: 404 });
        }
      }

      // 📋 VALIDATE AND SANITIZE OUTPUT
      if (!stdout || stdout.trim() === "") {
        return NextResponse.json({
          success: false,
          error: "Empty_Response",
          message: "No video information received from the source.",
          platform: detectPlatform(url)
        }, { status: 500 });
      }

      // 🔍 SAFE JSON PARSING
      let videoInfo;
      try {
        const cleanOutput = stdout.trim();
        videoInfo = JSON.parse(cleanOutput);
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        return NextResponse.json({
          success: false,
          error: "Invalid_Response",
          message: "Received invalid data format from video source.",
          platform: detectPlatform(url)
        }, { status: 500 });
      }

      // 🎬 HANDLE FORMATS
      if (!videoInfo.formats || !Array.isArray(videoInfo.formats)) {
        if (videoInfo.url) {
          // Create fallback format from direct URL
          videoInfo.formats = [{
            format_id: 'direct',
            url: videoInfo.url,
            ext: videoInfo.ext || 'mp4',
            quality: 'default',
            vcodec: videoInfo.vcodec || 'h264',
            acodec: videoInfo.acodec || 'aac',
            format_note: 'Direct URL',
            tbr: videoInfo.tbr || 0
          }];
        } else {
          return NextResponse.json({
            success: false,
            error: "No_Formats_Available",
            message: "This video has no downloadable formats available.",
            platform: detectPlatform(url)
          }, { status: 422 });
        }
      }

      console.log(`✅ Successfully extracted ${videoInfo.formats.length} formats`);
      
      // 🔄 PROCESS FORMATS
      const processedFormats = processFormats(videoInfo.formats);

      // 🚀 RETURN SUCCESS RESPONSE
      return NextResponse.json({
        success: true,
        title: videoInfo.title || "Unknown Title",
        description: videoInfo.description?.substring(0, 200) || "",
        duration: formatDuration(videoInfo.duration),
        thumbnail: getBestThumbnail(videoInfo),
        uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
        upload_date: formatUploadDate(videoInfo.upload_date),
        view_count: formatNumber(videoInfo.view_count),
        like_count: formatNumber(videoInfo.like_count),
        formats: processedFormats.all,
        recommended: processedFormats.recommended,
        videoOnly: processedFormats.videoOnly,
        audioOnly: processedFormats.audioOnly,
        combined: processedFormats.combined,
        platform: detectPlatform(url),
        url: url,
        extracted_at: new Date().toISOString()
      }, {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes cache
          'Content-Type': 'application/json'
        }
      });

    } catch (execError: any) {
      console.error("💥 yt-dlp execution error:", execError);
      
      let errorResponse = {
        success: false,
        error: "Execution_Failed",
        message: "Video processing failed",
        platform: detectPlatform(url),
        details: null as string | null
      };
      
      let statusCode = 500;
      
      // 🔍 SPECIFIC ERROR HANDLING
      if (execError.code === "ENOENT") {
        errorResponse.error = "Service_Unavailable";
        errorResponse.message = "Video processing service is temporarily unavailable";
        statusCode = 503;
      } else if (execError.signal === "SIGKILL" || execError.killed) {
        errorResponse.error = "Request_Timeout";
        errorResponse.message = "Request timed out while processing video";
        statusCode = 408;
        
        if (url.includes('instagram.com')) {
          errorResponse.message = "Instagram request timed out (rate limiting active)";
          statusCode = 429;
        }
      } else if (execError.stderr?.includes("Network") || 
                 execError.stderr?.includes("connection")) {
        errorResponse.error = "Network_Error";
        errorResponse.message = "Network connection failed while processing video";
        statusCode = 503;
      }
      
      if (execError.stderr) {
        errorResponse.details = execError.stderr.substring(0, 200);
      }

      return NextResponse.json(errorResponse, { status: statusCode });
    }

  } catch (error: any) {
    console.error("💀 Fatal error in format extraction:", error);
    return NextResponse.json({
      success: false,
      error: "Internal_Server_Error",
      message: "An unexpected error occurred while processing your request",
      platform: "unknown"
    }, { status: 500 });
  }
}

// 🛠️ HELPER FUNCTIONS (Updated)

function detectPlatform(url: string): string {
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) return 'youtube';
  if (cleanUrl.includes('instagram.com')) return 'instagram';
  if (cleanUrl.includes('tiktok.com')) return 'tiktok';
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) return 'facebook';
  if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) return 'twitter';
  if (cleanUrl.includes('vimeo.com')) return 'vimeo';
  if (cleanUrl.includes('dailymotion.com')) return 'dailymotion';
  return 'generic';
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
      format_id: format.format_id || 'default',
      ext: format.ext || "mp4",
      quality: getQualityLabel(format),
      resolution: getResolution(format),
      filesize: getFileSize(format.filesize),
      filesizeMB: getFileSizeMB(format.filesize),
      fps: format.fps || null,
      vcodec: format.vcodec || 'h264',
      acodec: format.acodec || 'aac',
      tbr: Math.round(format.tbr || 0),
      vbr: Math.round(format.vbr || 0),
      abr: Math.round(format.abr || 0),
      type: getFormatType(format),
      note: format.format_note || "",
      isRecommended: isRecommendedFormat(format),
      language: format.language || null
    };

    // Avoid duplicates
    const uniqueKey = `${processedFormat.quality}_${processedFormat.ext}_${processedFormat.type}`;
    if (seenFormats.has(uniqueKey)) return;
    seenFormats.add(uniqueKey);

    all.push(processedFormat);

    // Categorize formats
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

  // Sort by quality
  const sortByQuality = (a: any, b: any) => {
    const aHeight = parseInt(a.resolution) || 0;
    const bHeight = parseInt(b.resolution) || 0;
    if (aHeight !== bHeight) return bHeight - aHeight;
    return (b.tbr || 0) - (a.tbr || 0);
  };

  console.log(`🔄 Processed ${formats.length} raw → ${all.length} unique formats`);

  return {
    all: all.sort(sortByQuality),
    recommended: recommended.sort(sortByQuality).slice(0, 6),
    videoOnly: videoOnly.sort(sortByQuality),
    audioOnly: audioOnly.sort((a, b) => (b.abr || 0) - (a.abr || 0)),
    combined: combined.sort(sortByQuality)
  };
}

function getQualityLabel(format: any): string {
  if (format.height) return `${format.height}p`;
  if (format.format_note) return format.format_note;
  if (format.abr) return `${format.abr}kbps`;
  return "default";
}

function getResolution(format: any): string {
  if (format.height && format.width) return `${format.width}x${format.height}`;
  if (format.height) return `${Math.round(format.height * 16/9)}x${format.height}`;
  return "audio";
}

function getFileSize(size: number | null): string {
  if (!size || size <= 0) return "unknown";
  const mb = size / (1024 * 1024);
  const gb = mb / 1024;
  if (gb >= 1) return `${gb.toFixed(1)}GB`;
  if (mb >= 0.1) return `${mb.toFixed(1)}MB`;
  return `${(size / 1024).toFixed(0)}KB`;
}

function getFileSizeMB(size: number | null): number {
  if (!size || size <= 0) return 0;
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
  if (!hasVideo && hasAudio && format.abr >= 128) return true;
  
  return false;
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

function getBestThumbnail(videoInfo: any): string {
  if (videoInfo.thumbnail) return videoInfo.thumbnail;
  if (videoInfo.thumbnails && Array.isArray(videoInfo.thumbnails)) {
    const sortedThumbnails = videoInfo.thumbnails
      .filter((t: any) => t.url)
      .sort((a: any, b: any) => {
        const aSize = (a.width || 0) * (a.height || 0);
        const bSize = (b.width || 0) * (b.height || 0);
        return bSize - aSize;
      });
    
    if (sortedThumbnails.length > 0) return sortedThumbnails[0].url;
  }
  return "";
}

function formatUploadDate(date: string | null): string {
  if (!date) return "";
  try {
    if (date.length === 8) {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      return `${year}-${month}-${day}`;
    }
    return date;
  } catch {
    return "";
  }
}
