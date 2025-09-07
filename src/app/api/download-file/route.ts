

// import { NextRequest, NextResponse } from "next/server";
// import { createReadStream, promises as fs } from "fs";
// import path from "path";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const filename = searchParams.get("filename");

//     if (!filename) {
//       return new NextResponse("Filename parameter missing", { status: 400 });
//     }

//     const filePath = path.join(process.cwd(), "public", "downloads", filename);

//     // Check if file exists
//     try {
//       await fs.access(filePath);
//     } catch {
//       return new NextResponse("File not found", { status: 404 });
//     }

//     // Get file stats
//     const stats = await fs.stat(filePath);

//     // Create read stream
//     const fileStream = createReadStream(filePath);

//     // 🔧 Set proper headers for browser download
//     const headers = new Headers();
//     headers.set("Content-Type", "application/octet-stream");
//     headers.set("Content-Length", stats.size.toString());
//     headers.set("Content-Disposition", `attachment; filename="${filename}"`);
//     headers.set("Cache-Control", "no-cache");

//     // 🚀 Delete file after streaming starts
//     fileStream.on("open", () => {
//       console.log(`Streaming file: ${filename}`);
//     });

//     fileStream.on("end", async () => {
//       try {
//         await fs.unlink(filePath);
//         console.log(`File deleted from server: ${filename}`);
//       } catch (err) {
//         console.error("Failed to delete file:", err);
//       }
//     });

//     fileStream.on("error", async (err) => {
//       console.error("Stream error:", err);
//       try {
//         await fs.unlink(filePath);
//       } catch (deleteErr) {
//         console.error("Failed to delete file after error:", deleteErr);
//       }
//     });

//     // 🌊 Return file stream as response
//     return new NextResponse(fileStream as any, { headers });
//   } catch (error: any) {
//     console.error("Download file error:", error);
//     return new NextResponse("Download failed", { status: 500 });
//   }
// }

// app/api/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReadStream, statSync, existsSync, unlinkSync } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return new Response("Filename parameter missing", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "downloads", filename);

    if (!existsSync(filePath)) {
      return new Response("File not found", { status: 404 });
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;

    // 🔥 RANGE SUPPORT FOR BROWSER PROGRESS
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

    // 🚀 OPTIMIZED STREAM FOR BROWSER PROGRESS
    const stream = createReadStream(filePath, {
      start,
      end,
      highWaterMark: 1 * 1024 * 1024 // 1MB chunks for smooth progress
    });

    // 🗑️ AUTO-DELETE AFTER DOWNLOAD
    let downloadStarted = false;
    
    stream.on('open', () => {
      downloadStarted = true;
      console.log(`🚀 Browser Download started: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB)`);
      
      // Delete file after conservative time
      const estimatedSeconds = Math.max(30, Math.min(300, fileSize / (1024 * 1024) * 2)); // 2 seconds per MB, min 30s, max 5min
      
      setTimeout(() => {
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
            console.log(`🗑️ Auto-deleted: ${filename} after ${estimatedSeconds}s`);
          }
        } catch (err) {
          console.error('Delete error:', err);
        }
      }, estimatedSeconds * 1000);
    });

    // Error cleanup
    stream.on('error', (err) => {
      console.error("Stream error:", err);
      setTimeout(() => {
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
            console.log(`🗑️ Error cleanup: ${filename}`);
          }
        } catch (deleteErr) {
          console.error('Cleanup error:', deleteErr);
        }
      }, 5000);
    });

    // 🔥 PERFECT HEADERS FOR BROWSER PROGRESS BAR
    const headers = new Headers({
      // 📦 Basic file headers
      'Content-Type': 'application/octet-stream',
      'Content-Length': contentLength.toString(),
      'Content-Disposition': `attachment; filename="${filename}"`,
      
      // 🚀 ESSENTIAL FOR BROWSER PROGRESS
      'Accept-Ranges': 'bytes',
      'Content-Transfer-Encoding': 'binary',
      
      // 📊 PROGRESS SUPPORT HEADERS
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      
      // 🔄 CONNECTION HEADERS
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=15, max=100',
      
      // 🎯 BROWSER COMPATIBILITY
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      
      // 🚀 NGINX OPTIMIZATION (if using nginx)
      'X-Accel-Buffering': 'no',
      
      // 📅 FILE INFO FOR RESUME SUPPORT
      'Last-Modified': stat.mtime.toUTCString(),
      'ETag': `"${stat.size}-${stat.mtime.getTime()}"`,
    });

    // 🔥 RANGE HEADER FOR PARTIAL CONTENT
    if (rangeHeader) {
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    }

    console.log(`🚀 BROWSER-STREAMING: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB) - Range: ${start}-${end}`);

    // 📊 RETURN WITH PROPER STATUS CODE
    return new Response(stream as any, {
      status: rangeHeader ? 206 : 200, // 206 for partial content, 200 for full
      headers: headers,
    });

  } catch (error: any) {
    console.error("❌ Download error:", error);
    return new Response("Download failed", { status: 500 });
  }
}
