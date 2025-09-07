// import { NextRequest, NextResponse } from "next/server";
// import { createReadStream, statSync, existsSync } from "fs";
// import path from "path";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const filename = searchParams.get("filename");

//     if (!filename) {
//       return new Response("Filename required", { status: 400 });
//     }

//     // 🔥 CORRECT FILE PATH
//     const filePath = path.join(process.cwd(), "public", "downloads", filename);
    
//     console.log(`🔍 Looking for file: ${filePath}`);

//     if (!existsSync(filePath)) {
//       console.error(`❌ File not found: ${filePath}`);
//       return new Response("File not found", { status: 404 });
//     }

//     const stat = statSync(filePath);
//     const fileSize = stat.size;

//     // 🔥 RANGE REQUESTS SUPPORT
//     let start = 0;
//     let end = fileSize - 1;
    
//     const rangeHeader = request.headers.get("range");
//     if (rangeHeader) {
//       const parts = rangeHeader.replace(/bytes=/, "").split("-");
//       start = parseInt(parts[0], 10);
//       end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//     }

//     // Validate range
//     if (start >= fileSize || end >= fileSize || start > end) {
//       return new Response("Range not satisfiable", { status: 416 });
//     }

//     const contentLength = end - start + 1;

//     // 🚀 ULTRA-FAST STREAMING
//     const stream = createReadStream(filePath, {
//       start,
//       end,
//       highWaterMark: 4 * 1024 * 1024 // 4MB chunks for maximum speed
//     });

//     // 🔥 OPTIMIZED HEADERS
//     const headers = new Headers({
//       'Content-Type': 'application/octet-stream',
//       'Content-Length': contentLength.toString(),
//       'Content-Disposition': `attachment; filename="${filename}"`,
//       'Accept-Ranges': 'bytes',
//       'Cache-Control': 'no-cache, no-store, must-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0',
//       'Connection': 'keep-alive',
//       'X-Accel-Buffering': 'no',
//     });

//     if (rangeHeader) {
//       headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
//     }

//     console.log(`🚀 STREAMING: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB) - Range: ${start}-${end}`);

//     return new Response(stream as any, {
//       status: rangeHeader ? 206 : 200,
//       headers: headers,
//     });

//   } catch (error: any) {
//     console.error("❌ Streaming error:", error);
//     return new Response("Download failed", { status: 500 });
//   }
// }


// import { NextRequest, NextResponse } from "next/server";
// import { createReadStream, statSync, existsSync } from "fs";
// import path from "path";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const filename = searchParams.get("filename");

//     if (!filename) {
//       return new Response("Filename required", { status: 400 });
//     }

//     // 🔥 CORRECT FILE PATH
//     const filePath = path.join(process.cwd(), "public", "downloads", filename);
    
//     console.log(`🔍 Looking for file: ${filePath}`);

//     if (!existsSync(filePath)) {
//       console.error(`❌ File not found: ${filePath}`);
//       return new Response("File not found", { status: 404 });
//     }

//     const stat = statSync(filePath);
//     const fileSize = stat.size;

//     // 🔥 RANGE REQUESTS SUPPORT
//     let start = 0;
//     let end = fileSize - 1;
    
//     const rangeHeader = request.headers.get("range");
//     if (rangeHeader) {
//       const parts = rangeHeader.replace(/bytes=/, "").split("-");
//       start = parseInt(parts[0], 10);
//       end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//     }

//     // Validate range
//     if (start >= fileSize || end >= fileSize || start > end) {
//       return new Response("Range not satisfiable", { status: 416 });
//     }

//     const contentLength = end - start + 1;

//     // 🚀 ULTRA-FAST STREAMING
//     const stream = createReadStream(filePath, {
//       start,
//       end,
//       highWaterMark: 4 * 1024 * 1024 // 4MB chunks for maximum speed
//     });

//     // 🔥 OPTIMIZED HEADERS
//     const headers = new Headers({
//       'Content-Type': 'application/octet-stream',
//       'Content-Length': contentLength.toString(),
//       'Content-Disposition': `attachment; filename="${filename}"`,
//       'Accept-Ranges': 'bytes',
//       'Cache-Control': 'no-cache, no-store, must-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0',
//       'Connection': 'keep-alive',
//       'X-Accel-Buffering': 'no',
//     });

//     if (rangeHeader) {
//       headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
//     }

//     console.log(`🚀 STREAMING: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB) - Range: ${start}-${end}`);

//     return new Response(stream as any, {
//       status: rangeHeader ? 206 : 200,
//       headers: headers,
//     });

//   } catch (error: any) {
//     console.error("❌ Streaming error:", error);
//     return new Response("Download failed", { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { createReadStream, promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return new NextResponse("Filename parameter missing", { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "downloads", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Get file stats
    const stats = await fs.stat(filePath);

    // Create read stream
    const fileStream = createReadStream(filePath);

    // 🔧 Set proper headers for browser download
    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", stats.size.toString());
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "no-cache");

    // 🚀 Delete file after streaming starts
    fileStream.on("open", () => {
      console.log(`Streaming file: ${filename}`);
    });

    fileStream.on("end", async () => {
      try {
        await fs.unlink(filePath);
        console.log(`File deleted from server: ${filename}`);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    });

    fileStream.on("error", async (err) => {
      console.error("Stream error:", err);
      try {
        await fs.unlink(filePath);
      } catch (deleteErr) {
        console.error("Failed to delete file after error:", deleteErr);
      }
    });

    // 🌊 Return file stream as response
    return new NextResponse(fileStream as any, { headers });
  } catch (error: any) {
    console.error("Download file error:", error);
    return new NextResponse("Download failed", { status: 500 });
  }
}
