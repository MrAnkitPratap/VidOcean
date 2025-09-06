import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync, existsSync } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return new Response("Filename required", { status: 400 });
    }

    // 🔥 CORRECT FILE PATH
    const filePath = path.join(process.cwd(), "public", "downloads", filename);
    
    console.log(`🔍 Looking for file: ${filePath}`);

    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return new Response("File not found", { status: 404 });
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;

    // 🔥 RANGE REQUESTS SUPPORT
    let start = 0;
    let end = fileSize - 1;
    
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      return new Response("Range not satisfiable", { status: 416 });
    }

    const contentLength = end - start + 1;

    // 🚀 ULTRA-FAST STREAMING
    const stream = createReadStream(filePath, {
      start,
      end,
      highWaterMark: 4 * 1024 * 1024 // 4MB chunks for maximum speed
    });

    // 🔥 OPTIMIZED HEADERS
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'Content-Length': contentLength.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    if (rangeHeader) {
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    }

    console.log(`🚀 STREAMING: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB) - Range: ${start}-${end}`);

    return new Response(stream as any, {
      status: rangeHeader ? 206 : 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error("❌ Streaming error:", error);
    return new Response("Download failed", { status: 500 });
  }
}
