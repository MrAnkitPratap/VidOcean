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

    console.log("Getting video info for:", url);

    // 🔧 Fixed: Use --dump-json for info only
    const command = `yt-dlp --dump-json --no-download "${url}"`;

    const { stdout, stderr } = await execAsync(command, { timeout: 10000 });

    if (stdout) {
      const info = JSON.parse(stdout);
      return NextResponse.json({
        success: true,
        info: {
          title: info.title,
          thumbnail: info.thumbnail,
          uploader: info.uploader || info.channel,
          duration: info.duration,
          view_count: info.view_count,
          like_count: info.like_count,
          description: info.description?.substring(0, 200),
        },
      });
    } else {
      throw new Error("No video info found");
    }
  } catch (error: any) {
    console.error("Video info error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Could not get video info",
      },
      { status: 500 }
    );
  }
}
