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
    
    // 🔥 SUPER FAST STREAMING WITH 1MB CHUNKS
    const stream = createReadStream(filePath, { 
      start, 
      end,
      highWaterMark: 1024 * 1024 // 1MB chunks for maximum speed
    });

    // 🔥 OPTIMIZED HEADERS FOR INSTANT DOWNLOAD
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'Content-Length': chunkSize.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'identity', // Disable chunked encoding
    });

    // Add range headers if partial content
    if (range) {
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    }

    // 🔥 INSTANT STREAMING WITHOUT EARLY DELETION
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        
        stream.on('end', () => {
          controller.close();
          console.log(`Streaming completed for: ${filename}`);
          
          // 🚨 DO NOT DELETE FILE HERE - Let cleanup job handle it
          // File will be cleaned up by background process after sufficient time
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
