import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const platform = searchParams.get("platform");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Use yt-dlp to get video info
    const command = `yt-dlp --dump-json --no-download "${url}"`;

    try {
      const { stdout } = await execAsync(command);
      const videoInfo = JSON.parse(stdout);

      const preview = {
        title: videoInfo.title || "Media Content",
        description: videoInfo.description?.substring(0, 200) + "..." || "",
        thumbnail:
          videoInfo.thumbnail ||
          `https://via.placeholder.com/320x180?text=${platform}`,
        author: videoInfo.uploader || videoInfo.channel || "Unknown",
        duration: formatDuration(videoInfo.duration || 0),
        viewCount: formatNumber(videoInfo.view_count || 0),
        likeCount: formatNumber(videoInfo.like_count || 0),
        platform: platform || "unknown",
        type: videoInfo.vcodec !== "none" ? "video" : "audio",
        quality: getAvailableQualities(videoInfo.formats || []),
      };

      return NextResponse.json({ success: true, preview });
    } catch (error) {
      // Return basic preview if yt-dlp fails
      return NextResponse.json({
        success: true,
        preview: {
          title: `${platform} Content`,
          thumbnail: `https://via.placeholder.com/320x180?text=${platform}`,
          author: `${platform} User`,
          platform: platform || "unknown",
          type: "video",
          description: "Preview not available, but download should work",
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatDuration(seconds: number): string {
  if (!seconds) return "Unknown";
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
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function getAvailableQualities(formats: any[]): string[] {
  const qualities = new Set<string>();
  formats.forEach((format) => {
    if (format.height) {
      if (format.height >= 1080) qualities.add("1080p");
      else if (format.height >= 720) qualities.add("720p");
      else if (format.height >= 480) qualities.add("480p");
    }
  });
  return Array.from(qualities);
}
