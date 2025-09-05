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
//     console.log("📋 Active download IDs:", Array.from(activeDownloads.keys()));

//     // Start download
//     const formatString = formatId || "bestvideo+bestaudio/best[ext=mp4]/best";
//     const ytdlpArgs = [
//       "-f",
//       formatString,
//       "-o",
//       outputTemplate,
//       "--no-part",
//       "--no-continue",
//       "--no-overwrites",
//       "--merge-output-format",
//       "mp4",
//       "--progress",
//       "--newline",
//       url,
//     ];

//     console.log("🚀 Starting download process for:", downloadId);

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
import { activeDownloads } from "../shared/downloads";

export async function POST(request: NextRequest) {
  try {
    const { url, platform, formatId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Generate unique download ID
    const downloadId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    console.log("🆔 Generated download ID:", downloadId);
    console.log("🎯 Requested format:", formatId);

    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedPlatform = (platform || "video").replace(
      /[^a-zA-Z0-9]/g,
      ""
    );
    const outputTemplate = path.join(
      downloadsDir,
      `${sanitizedPlatform}_${timestamp}.%(ext)s`
    );

    // ✅ CRITICAL: Add to activeDownloads IMMEDIATELY
    activeDownloads.set(downloadId, {
      progress: {
        status: "starting",
        percentage: 0,
        speed: null,
        eta: null,
        downloaded: "0MB",
        totalSize: null,
        filename: null,
        message: "Initializing download...",
      },
    });

    console.log("✅ Added to activeDownloads:", downloadId);
    console.log("📊 Active downloads count:", activeDownloads.size);

    // 🎵 FIXED: Always include audio with video
    let formatString;
    if (!formatId || formatId === "auto") {
      // Default: Best video + best audio combined
      formatString = "bestvideo+bestaudio/best";
    } else {
      // Check if it's audio-only format
      const audioOnlyFormats = [
        "140",
        "139",
        "251",
        "250",
        "249",
        "278",
        "394",
        "396",
        "397",
        "398",
      ];

      if (
        audioOnlyFormats.includes(formatId) ||
        formatId.toLowerCase().includes("audio")
      ) {
        // Audio only - no video
        formatString = `${formatId}[ext=m4a]/${formatId}/bestaudio`;
      } else {
        // Video format - ALWAYS combine with best audio
        formatString = `${formatId}+bestaudio/${formatId}/bestvideo+bestaudio/best`;
      }
    }

    console.log("🎵 Using format string (with audio):", formatString);

    const ytdlpArgs = [
      "-f",
      formatString,
      "-o",
      outputTemplate,
      "--no-part",
      "--no-continue",
      "--no-overwrites",
      // 🔧 CONDITIONAL: Only merge to mp4 for video formats
      ...(formatString.includes("bestaudio") &&
      !formatString.includes("[ext=m4a]")
        ? ["--merge-output-format", "mp4"]
        : []),
      "--progress",
      "--newline",
      url,
    ];

    console.log("🚀 Starting download with args:", ytdlpArgs);

    // Start download process asynchronously
    setImmediate(() => {
      startDownloadWithProgress(
        ytdlpArgs,
        downloadId,
        sanitizedPlatform,
        timestamp
      );
    });

    return NextResponse.json({
      success: true,
      downloadId: downloadId,
      message: "Download started! Track progress with SSE.",
    });
  } catch (error: any) {
    console.error("💥 Download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function startDownloadWithProgress(
  args: string[],
  downloadId: string,
  platform: string,
  timestamp: number
) {
  console.log("🎬 Starting yt-dlp process for:", downloadId);

  const ytdlp = spawn("yt-dlp", args);
  let hasError = false;

  // Update status to downloading
  if (activeDownloads.has(downloadId)) {
    activeDownloads.get(downloadId).progress.status = "downloading";
    activeDownloads.get(downloadId).progress.message = "Download started...";
    console.log("📝 Updated status to downloading");
  }

  ytdlp.stdout.on("data", (data) => {
    parseProgress(data.toString(), downloadId);
  });

  ytdlp.stderr.on("data", (data) => {
    parseProgress(data.toString(), downloadId);
  });

  ytdlp.on("close", (code) => {
    console.log(`🏁 yt-dlp finished with code: ${code} for ${downloadId}`);

    if (code === 0 && !hasError) {
      try {
        const downloadsDir = path.join(process.cwd(), "public", "downloads");
        const files = fs.readdirSync(downloadsDir);
        const downloadedFile = files.find((file) =>
          file.includes(`${platform}_${timestamp}`)
        );

        if (downloadedFile) {
          const fileStats = fs.statSync(
            path.join(downloadsDir, downloadedFile)
          );
          const download = activeDownloads.get(downloadId);
          if (download) {
            download.progress = {
              ...download.progress,
              status: "completed",
              percentage: 100,
              filename: downloadedFile,
              fileSize: Math.round(fileStats.size / (1024 * 1024)),
              message: "Download completed successfully!",
            };
            console.log("✅ Download completed:", downloadedFile);
          }
        } else {
          console.log(
            "❌ Downloaded file not found, searching in:",
            downloadsDir
          );
          console.log("📁 Available files:", files);
          updateProgressError(downloadId, "Downloaded file not found");
        }
      } catch (err) {
        console.error("File processing error:", err);
        updateProgressError(downloadId, "File processing failed");
      }
    } else {
      updateProgressError(downloadId, `Download failed with code ${code}`);
    }
  });

  ytdlp.on("error", (error) => {
    hasError = true;
    console.error("💥 yt-dlp error:", error);
    updateProgressError(downloadId, `Process error: ${error.message}`);
  });
}

function parseProgress(output: string, downloadId: string) {
  if (!activeDownloads.has(downloadId)) return;

  const download = activeDownloads.get(downloadId);
  const lines = output.split("\n");

  for (const line of lines) {
    // 🔧 ENHANCED: Multiple regex patterns to catch all yt-dlp progress formats

    // Pattern 1: [download]  45.2% of  120.5MiB at  2.3MiB/s ETA 00:25 (your original)
    let progressMatch = line.match(
      /\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+(\d{2}:\d{2})/
    );

    // Pattern 2: [download] 45.2% of 120.5MiB at 2.3MiB/s (without ETA)
    if (!progressMatch) {
      progressMatch = line.match(
        /\[download\]\s*(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)\s+at\s+([^\s]+)/
      );
    }

    // Pattern 3: [download] 45.2% of ~120.5MiB (with estimated size ~)
    if (!progressMatch) {
      progressMatch = line.match(
        /\[download\]\s*(\d{1,3}(?:\.\d+)?)%\s+of\s+~?([^\s]+)/
      );
    }

    // Pattern 4: Simple [download] 45.2% (minimal format)
    if (!progressMatch) {
      const simpleMatch = line.match(/\[download\]\s*(\d{1,3}(?:\.\d+)?)%/);
      if (simpleMatch) {
        const percentage = parseFloat(simpleMatch[1]);
        console.log(`📈 Progress: ${percentage}%`); // Debug log

        download.progress = {
          ...download.progress,
          status: "downloading",
          percentage: percentage,
          message: "Downloading...",
        };
        return;
      }
    }

    // If we found a match with more details
    if (progressMatch) {
      const [, percentage, totalSizeStr, speedStr, etaStr] = progressMatch;
      const parsedPercentage = parseFloat(percentage);

      console.log(
        `📊 Progress: ${parsedPercentage}% of ${totalSizeStr || "unknown"}`
      ); // Debug log

      download.progress = {
        ...download.progress,
        status: "downloading",
        percentage: parsedPercentage,
        speed: speedStr ? speedStr.replace("iB", "B") : null,
        eta: etaStr || null,
        totalSize: totalSizeStr ? totalSizeStr.replace("iB", "B") : null,
        downloaded: totalSizeStr
          ? `${(
              (parsedPercentage / 100) *
              parseFloat(totalSizeStr.replace(/[^\d.]/g, ""))
            ).toFixed(1)}MB`
          : `${parsedPercentage}%`,
        message: "Downloading...",
      };
      return;
    }

    // Parse completed (your original code)
    const completedMatch = line.match(
      /\[download\]\s+100%\s+of\s+([^\s]+)\s+in\s+(\d{2}:\d{2})/
    );

    if (completedMatch) {
      console.log("🏁 Download completed, processing..."); // Debug log
      download.progress = {
        ...download.progress,
        status: "processing",
        percentage: 100,
        message: "Processing and merging...",
      };
      return;
    }

    // Check for errors (your original code)
    if (line.includes("ERROR")) {
      console.log("❌ Error in output:", line); // Debug log
      updateProgressError(downloadId, line.substring(line.indexOf("ERROR")));
      return;
    }

    // 🔧 NEW: Debug unmatched progress lines
    if (line.includes("[download]") && line.includes("%")) {
      console.log("🔍 Unmatched progress line:", line);
    }
  }
}

function updateProgressError(downloadId: string, error: string) {
  if (activeDownloads.has(downloadId)) {
    const download = activeDownloads.get(downloadId);
    download.progress = {
      ...download.progress,
      status: "error",
      error: error,
      message: "Download failed",
    };
    console.error("❌ Download error for", downloadId, ":", error);
  }
}
