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

    // 🔧 FIXED: Enhanced command with anti-bot measures
    const command = `yt-dlp -j --no-warnings --no-playlist --ignore-errors --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" --extractor-retries 3 --socket-timeout 30 "${url}"`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 45000, // 45 seconds timeout
        maxBuffer: 1024 * 1024 * 50, // 50MB buffer
      });

      // 🔧 Log stderr for debugging
      if (stderr) {
        console.log("⚠️ yt-dlp stderr:", stderr);

        // Check for common YouTube errors
        if (stderr.includes("Sign in to confirm")) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Video requires authentication. YouTube is detecting automated requests.",
            },
            { status: 429 }
          );
        }

        if (
          stderr.includes("Video unavailable") ||
          stderr.includes("Private video")
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Video is private or unavailable.",
            },
            { status: 404 }
          );
        }

        if (
          stderr.includes("Failed to extract") ||
          stderr.includes("Unable to extract")
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Unable to extract video information. Video may be restricted.",
            },
            { status: 500 }
          );
        }
      }

      if (!stdout || stdout.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error:
              "No video data received. Video may be unavailable or restricted.",
          },
          { status: 500 }
        );
      }

      // 🔧 Parse JSON with error handling
      let videoInfo;
      try {
        videoInfo = JSON.parse(stdout.trim());
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: "Invalid response from video source.",
          },
          { status: 500 }
        );
      }

      if (!videoInfo.formats || !Array.isArray(videoInfo.formats)) {
        return NextResponse.json(
          {
            success: false,
            error: "No video formats available for this content.",
          },
          { status: 500 }
        );
      }

      console.log(
        `✅ Found ${videoInfo.formats.length} formats for: ${
          videoInfo.title || "Unknown"
        }`
      );

      const processedFormats = processFormats(videoInfo.formats);

      return NextResponse.json({
        success: true,
        title: videoInfo.title || "Unknown Title",
        duration: formatDuration(videoInfo.duration),
        thumbnail: videoInfo.thumbnail,
        uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
        view_count: formatNumber(videoInfo.view_count),
        formats: processedFormats.all,
        recommended: processedFormats.recommended,
        videoOnly: processedFormats.videoOnly,
        audioOnly: processedFormats.audioOnly,
        combined: processedFormats.combined,
      });
    } catch (execError: any) {
      console.error("💥 yt-dlp execution error:", execError);

      let errorMessage = "Failed to get video information";

      if (execError.code === "ENOENT") {
        errorMessage = "yt-dlp not found. Please install yt-dlp on the server.";
      } else if (execError.signal === "SIGTERM") {
        errorMessage = "Request timeout. Video processing took too long.";
      } else if (execError.message.includes("timeout")) {
        errorMessage = "Request timeout. Please try again.";
      } else if (execError.stderr?.includes("Sign in to confirm")) {
        errorMessage = "YouTube anti-bot protection detected. Try again later.";
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("💀 Format listing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error while processing request",
      },
      { status: 500 }
    );
  }
}

function processFormats(formats: any[]) {
  const all: any[] = [];
  const recommended: any[] = [];
  const videoOnly: any[] = [];
  const audioOnly: any[] = [];
  const combined: any[] = [];

  formats.forEach((format) => {
    if (!format.format_id) return;

    const processedFormat = {
      format_id: format.format_id,
      ext: format.ext || "unknown",
      quality: getQualityLabel(format),
      resolution: getResolution(format),
      filesize: getFileSize(format.filesize),
      filesizeMB: getFileSizeMB(format.filesize),
      fps: format.fps || null,
      vcodec: format.vcodec,
      acodec: format.acodec,
      tbr: format.tbr,
      type: getFormatType(format),
      note: format.format_note || "",
      isRecommended: isRecommendedFormat(format),
    };

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

  return {
    all: all.sort(sortByQuality),
    recommended: recommended.sort(sortByQuality).slice(0, 10),
    videoOnly: videoOnly.sort(sortByQuality),
    audioOnly: audioOnly,
    combined: combined.sort(sortByQuality),
  };
}

function getQualityLabel(format: any): string {
  if (format.height) {
    return `${format.height}p`;
  } else if (format.format_note) {
    return format.format_note;
  } else if (format.abr) {
    return `${format.abr}kbps`;
  }
  return "unknown";
}

function getResolution(format: any): string {
  if (format.height && format.width) {
    return `${format.width}x${format.height}`;
  } else if (format.height) {
    return `${format.height}p`;
  }
  return "audio";
}

function getFileSize(size: number | null): string {
  if (!size) return "unknown";

  const bytes = size;
  const kb = bytes / 1024;
  const mb = bytes / (1024 * 1024);
  const gb = bytes / (1024 * 1024 * 1024);

  if (gb >= 1) {
    return `${gb.toFixed(1)}GB`;
  } else if (mb >= 1) {
    return `${mb.toFixed(1)}MB`;
  } else if (kb >= 1) {
    return `${kb.toFixed(1)}KB`;
  } else {
    return `${bytes}B`;
  }
}

function getFileSizeMB(size: number | null): number {
  if (!size) return 0;
  return Math.round((size / (1024 * 1024)) * 10) / 10;
}

function getFormatType(format: any): string {
  const hasVideo = format.vcodec && format.vcodec !== "none";
  const hasAudio = format.acodec && format.acodec !== "none";

  if (hasVideo && hasAudio) {
    return "video+audio";
  } else if (hasVideo) {
    return "video";
  } else if (hasAudio) {
    return "audio";
  }
  return "unknown";
}

function isRecommendedFormat(format: any): boolean {
  const hasVideo = format.vcodec && format.vcodec !== "none";
  const hasAudio = format.acodec && format.acodec !== "none";

  // Prioritize MP4 with both video and audio
  if (hasVideo && hasAudio && format.ext === "mp4") {
    return true;
  }

  // Common resolutions with audio
  if (
    format.height &&
    [720, 1080, 480, 360].includes(format.height) &&
    hasAudio
  ) {
    return true;
  }

  // Good audio formats
  if (format.acodec && !format.vcodec && ["m4a", "mp3"].includes(format.ext)) {
    return true;
  }

  return false;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatNumber(num: number): string {
  if (!num) return "";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
