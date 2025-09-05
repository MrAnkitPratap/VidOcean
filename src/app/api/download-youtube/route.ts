import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

// CORS Headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// ✅ Get video info endpoint (using --dump-json)
export async function GET(request: NextRequest) {
  let url: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    url = searchParams.get("url");

    if (!url || !isValidYouTubeURL(url)) {
      return NextResponse.json(
        { error: "Valid YouTube URL is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    console.log("Fetching video info for:", url);

    // ✅ Use yt-dlp --dump-json to get metadata
    const command = `yt-dlp --dump-json --no-download "${url}"`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    const videoInfo = JSON.parse(stdout);

    return NextResponse.json(
      {
        success: true,
        videoInfo: {
          title: videoInfo.title || "YouTube Video",
          thumbnail:
            videoInfo.thumbnail ||
            `https://img.youtube.com/vi/${extractYouTubeID(
              url
            )}/maxresdefault.jpg`,
          duration: formatDuration(videoInfo.duration || 0),
          uploader: videoInfo.uploader || videoInfo.channel || "Unknown",
          upload_date: videoInfo.upload_date,
          view_count: videoInfo.view_count || 0,
          like_count: videoInfo.like_count || 0,
          description: videoInfo.description?.substring(0, 200) + "..." || "",
          webpage_url: videoInfo.webpage_url || url,
          video_id: videoInfo.id || extractYouTubeID(url),
        },
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error("Video info error:", error);

    // ✅ Fallback with basic info if yt-dlp fails
    const videoId = extractYouTubeID(url || "");
    return NextResponse.json(
      {
        success: true,
        videoInfo: {
          title: "YouTube Video",
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: "Unknown",
          uploader: "YouTube Channel",
          upload_date: new Date().toISOString().split("T")[0],
          view_count: 0,
          like_count: 0,
          description: "Video description not available",
          webpage_url: url,
          video_id: videoId,
        },
      },
      { headers: corsHeaders() }
    );
  }
}

// ✅ Download endpoint (using direct yt-dlp command)
export async function POST(request: NextRequest) {
  try {
    const { url, quality = "720p" } = await request.json();

    if (!url || !isValidYouTubeURL(url)) {
      return NextResponse.json(
        { error: "Valid YouTube URL is required" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create downloads directory
    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const videoId = extractYouTubeID(url);
    const outputTemplate = path.join(
      downloadsDir,
      `${videoId}_${timestamp}.%(ext)s`
    );

    // ✅ Direct yt-dlp download command
    const formatString = getFormatString(quality);
    const command = `yt-dlp -f "${formatString}" -o "${outputTemplate}" "${url}"`;

    console.log("Executing download command:", command);

    const { stdout, stderr } = await execAsync(command);

    console.log("Download stdout:", stdout);
    if (stderr) console.log("Download stderr:", stderr);

    // Find downloaded file
    const files = fs.readdirSync(downloadsDir);
    const downloadedFile = files.find((file) =>
      file.includes(`${videoId}_${timestamp}`)
    );

    if (downloadedFile) {
      const filePath = `/downloads/${downloadedFile}`;
      const fileStats = fs.statSync(path.join(downloadsDir, downloadedFile));

      // Get video info for response
      let videoTitle = "Downloaded Video";
      try {
        const infoCommand = `yt-dlp --dump-json --no-download "${url}"`;
        const { stdout: infoStdout } = await execAsync(infoCommand);
        const videoInfo = JSON.parse(infoStdout);
        videoTitle = videoInfo.title || "Downloaded Video";
      } catch (e) {
        console.log("Could not get video title for response");
      }

      return NextResponse.json(
        {
          success: true,
          message: "Download completed successfully! 🎉",
          downloadUrl: filePath,
          filename: downloadedFile,
          fileSize: Math.round(fileStats.size / (1024 * 1024)), // Size in MB
          quality: quality,
          videoTitle: videoTitle,
        },
        { headers: corsHeaders() }
      );
    } else {
      throw new Error("Download completed but file not found");
    }
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Download failed: " + error.message,
        suggestion:
          "Try a different quality or check if the video is available",
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Helper functions
function isValidYouTubeURL(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
    /^https?:\/\/(www\.)?youtu\.be\/[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]{11}/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}/,
  ];

  return patterns.some((pattern) => pattern.test(url));
}

function extractYouTubeID(url: string): string {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

function getFormatString(quality: string): string {
  const formatMap = {
    best: "best[ext=mp4]/best",
    "1080p": "best[height<=1080][ext=mp4]/best[height<=1080]",
    "720p": "best[height<=720][ext=mp4]/best[height<=720]",
    "480p": "best[height<=480][ext=mp4]/best[height<=480]",
    "360p": "best[height<=360][ext=mp4]/best[height<=360]",
    audio: "bestaudio[ext=m4a]/bestaudio",
  };

  return formatMap[quality as keyof typeof formatMap] || formatMap["720p"];
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "Unknown";

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
