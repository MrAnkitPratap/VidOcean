import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { activeDownloads } from "../shared/downloads";

export async function POST(request: NextRequest) {
  try {
    const { url, platform, formatId } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "Instagram URL is required" },
        { status: 400 }
      );
    }

    if (!isInstagramUrl(url)) {
      return NextResponse.json(
        { error: "Please provide a valid Instagram URL" },
        { status: 400 }
      );
    }

    // Generate unique download ID
    const downloadId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    console.log("🆔 Instagram download ID:", downloadId);

    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const outputTemplate = path.join(
      downloadsDir,
      `instagram_${timestamp}.%(ext)s`
    );

    // Initialize progress tracking
    activeDownloads.set(downloadId, {
      progress: {
        status: "starting",
        percentage: 0,
        speed: null,
        eta: null,
        downloaded: "0MB",
        totalSize: null,
        filename: null,
        message: "Analyzing Instagram content...",
      },
    });

    console.log("✅ Added Instagram download to tracking:", downloadId);

    // Enhanced Instagram download arguments
    const ytdlpArgs = [
      "-f",
      "best[ext=mp4]/bestvideo+bestaudio/best",
      "-o",
      outputTemplate,
      "--no-part",
      "--no-continue",
      "--no-overwrites",
      "--write-thumbnail", // Download thumbnail for posts
      "--write-info-json", // Get metadata
      "--merge-output-format",
      "mp4",
      "--progress",
      "--newline",
      // Instagram specific options
      "--cookies-from-browser",
      "chrome", // Use browser cookies for access
      "--user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "--referer",
      "https://www.instagram.com/",
      "--extractor-retries",
      "5",
      "--sleep-interval",
      "1",
      "--max-sleep-interval",
      "3",
      url,
    ];

    console.log("🚀 Starting Instagram download:", url);

    // Start download process
    setImmediate(() => {
      startInstagramDownload(ytdlpArgs, downloadId, timestamp);
    });

    return NextResponse.json({
      success: true,
      downloadId: downloadId,
      message:
        "Instagram download started! Supports photos, videos, reels, and stories.",
    });
  } catch (error: any) {
    console.error("💥 Instagram download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start Instagram download: " + error.message,
      },
      { status: 500 }
    );
  }
}

function isInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("instagram.com");
  } catch {
    return false;
  }
}

function startInstagramDownload(
  args: string[],
  downloadId: string,
  timestamp: number
) {
  console.log("🎬 Starting Instagram yt-dlp process");

  const ytdlp = spawn("yt-dlp", args, {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let hasError = false;
  let contentType = "unknown";

  // Update status
  if (activeDownloads.has(downloadId)) {
    activeDownloads.get(downloadId).progress.status = "downloading";
    activeDownloads.get(downloadId).progress.message =
      "Downloading Instagram content...";
  }

  ytdlp.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("📥 Instagram stdout:", output);
    parseInstagramProgress(output, downloadId);

    // Detect content type
    if (output.includes("Downloading webpage")) {
      contentType = "post";
    } else if (output.includes("video")) {
      contentType = "video";
    }
  });

  ytdlp.stderr.on("data", (data) => {
    const output = data.toString();
    console.log("📥 Instagram stderr:", output);

    // Handle specific Instagram errors
    if (output.includes("Private feed")) {
      updateInstagramError(
        downloadId,
        "This Instagram account is private. Please make sure the content is public."
      );
      hasError = true;
    } else if (output.includes("Video unavailable")) {
      updateInstagramError(
        downloadId,
        "Instagram content is unavailable. It may have been deleted or restricted."
      );
      hasError = true;
    } else if (output.includes("Login required")) {
      updateInstagramError(
        downloadId,
        "Instagram requires login for this content. Try with a public post/reel."
      );
      hasError = true;
    } else if (output.includes("Not found")) {
      updateInstagramError(
        downloadId,
        "Instagram content not found. Please check the URL and try again."
      );
      hasError = true;
    } else {
      parseInstagramProgress(output, downloadId);
    }
  });

  ytdlp.on("close", (code) => {
    console.log(`🏁 Instagram yt-dlp finished with code: ${code}`);

    if (code === 0 && !hasError) {
      try {
        const downloadsDir = path.join(process.cwd(), "public", "downloads");
        const files = fs.readdirSync(downloadsDir);

        // Look for downloaded files (could be video, image, or thumbnail)
        const downloadedFiles = files.filter(
          (file) =>
            file.includes(`instagram_${timestamp}`) &&
            !file.includes(".info.json") &&
            (file.includes(".mp4") ||
              file.includes(".jpg") ||
              file.includes(".png") ||
              file.includes(".webp"))
        );

        if (downloadedFiles.length > 0) {
          const mainFile =
            downloadedFiles.find((f) => f.includes(".mp4")) ||
            downloadedFiles[0];
          const fileStats = fs.statSync(path.join(downloadsDir, mainFile));
          const download = activeDownloads.get(downloadId);

          if (download) {
            download.progress = {
              ...download.progress,
              status: "completed",
              percentage: 100,
              filename: mainFile,
              fileSize: Math.round(fileStats.size / (1024 * 1024)),
              message: `Instagram ${contentType} downloaded successfully!`,
            };
            console.log("✅ Instagram download completed:", mainFile);
          }
        } else {
          updateInstagramError(
            downloadId,
            "Instagram content downloaded but file not found. Content may be unsupported format."
          );
        }
      } catch (err) {
        console.error("Instagram file processing error:", err);
        updateInstagramError(downloadId, "Error processing Instagram download");
      }
    } else if (!hasError) {
      updateInstagramError(
        downloadId,
        `Instagram download failed. The content may be private, deleted, or restricted.`
      );
    }
  });

  ytdlp.on("error", (error) => {
    hasError = true;
    console.error("💥 Instagram yt-dlp process error:", error);
    updateInstagramError(
      downloadId,
      `Instagram download error: ${error.message}`
    );
  });
}

function parseInstagramProgress(output: string, downloadId: string) {
  if (!activeDownloads.has(downloadId)) return;

  const download = activeDownloads.get(downloadId);
  const lines = output.split("\n");

  for (const line of lines) {
    // Enhanced progress parsing for Instagram
    let progressMatch = line.match(
      /\[download\]\s+(\d{1,3}(?:\.\d+)?)%\s+of\s+([^\s]+)(?:\s+at\s+([^\s]+))?(?:\s+ETA\s+(\d{2}:\d{2}))?/
    );

    if (!progressMatch) {
      progressMatch = line.match(/\[download\]\s+(\d{1,3}(?:\.\d+)?)%/);
    }

    if (progressMatch) {
      const percentage = parseFloat(progressMatch[1]);
      const totalSize = progressMatch || null;
      const speed = progressMatch || null;
      const eta = progressMatch || null;

      console.log(`📊 Instagram progress: ${percentage}%`);

      download.progress = {
        ...download.progress,
        status: "downloading",
        percentage: percentage,
        speed: speed ? speed.replace("iB", "B") : null,
        eta: eta || null,
        totalSize: totalSize ? totalSize.replace("iB", "B") : null,
        downloaded: totalSize
          ? `${(
              (percentage / 100) *
              parseFloat(totalSize.replace(/[^\d.]/g, ""))
            ).toFixed(1)}MB`
          : `${percentage}%`,
        message: "Downloading Instagram content...",
      };
      return;
    }

    // Check for completion
    if (line.includes("[download] 100%")) {
      download.progress = {
        ...download.progress,
        status: "processing",
        percentage: 100,
        message: "Processing Instagram content...",
      };
      return;
    }

    // Check for specific Instagram messages
    if (line.includes("Extracting URL")) {
      download.progress = {
        ...download.progress,
        message: "Analyzing Instagram content...",
      };
    } else if (line.includes("Downloading webpage")) {
      download.progress = {
        ...download.progress,
        message: "Accessing Instagram content...",
      };
    }
  }
}

function updateInstagramError(downloadId: string, error: string) {
  if (activeDownloads.has(downloadId)) {
    const download = activeDownloads.get(downloadId);
    download.progress = {
      ...download.progress,
      status: "error",
      error: error,
      message: "Instagram download failed",
    };
    console.error("❌ Instagram download error:", error);
  }
}
