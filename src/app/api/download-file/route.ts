import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync, existsSync } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "downloads", filename);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;

    // 🔥 HANDLE RANGE REQUESTS (Resume support + faster downloads)
    const range = request.headers.get('range');
    let start = 0;
    let end = fileSize - 1;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    const chunkSize = (end - start) + 1;
    
    // 🔥 OPTIMIZED STREAMING WITH LARGE CHUNKS
    const stream = createReadStream(filePath, { 
      start, 
      end,
      highWaterMark: 256 * 1024 // 256KB chunks for maximum speed
    });

    // 🔥 PERFORMANCE HEADERS
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'Content-Length': chunkSize.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=5, max=1000',
    });

    // Add range headers if partial content
    if (range) {
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    }

    // 🔥 SUPER FAST STREAMING
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        
        stream.on('end', async () => {
          controller.close();
          // Delete file after streaming completes
          try {
            await import('fs').then(fs => fs.promises.unlink(filePath));
            console.log(`File deleted: ${filename}`);
          } catch (err) {
            console.error("Delete failed:", err);
          }
        });
        
        stream.on('error', (error) => {
          console.error('Stream error:', error);
          controller.error(error);
        });
      }
    });

    return new Response(readableStream, {
      status: range ? 206 : 200, // Partial Content or OK
      headers: headers,
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
