

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

// // app/api/download/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { createReadStream, statSync, existsSync, unlinkSync } from "fs";
// import path from "path";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const filename = searchParams.get("filename");

//     if (!filename) {
//       return new Response("Filename parameter missing", { status: 400 });
//     }

//     const filePath = path.join(process.cwd(), "public", "downloads", filename);

//     if (!existsSync(filePath)) {
//       return new Response("File not found", { status: 404 });
//     }

//     const stat = statSync(filePath);
//     const fileSize = stat.size;

//     // 🔥 RANGE SUPPORT FOR BROWSER PROGRESS
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

//     // 🚀 OPTIMIZED STREAM FOR BROWSER PROGRESS
//     const stream = createReadStream(filePath, {
//       start,
//       end,
//       highWaterMark: 1 * 1024 * 1024 // 1MB chunks for smooth progress
//     });

//     // 🗑️ AUTO-DELETE AFTER DOWNLOAD
//     let downloadStarted = false;
    
//     stream.on('open', () => {
//       downloadStarted = true;
//       console.log(`🚀 Browser Download started: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB)`);
      
//       // Delete file after conservative time
//       const estimatedSeconds = Math.max(30, Math.min(300, fileSize / (1024 * 1024) * 2)); // 2 seconds per MB, min 30s, max 5min
      
//       setTimeout(() => {
//         try {
//           if (existsSync(filePath)) {
//             unlinkSync(filePath);
//             console.log(`🗑️ Auto-deleted: ${filename} after ${estimatedSeconds}s`);
//           }
//         } catch (err) {
//           console.error('Delete error:', err);
//         }
//       }, estimatedSeconds * 1000);
//     });

//     // Error cleanup
//     stream.on('error', (err) => {
//       console.error("Stream error:", err);
//       setTimeout(() => {
//         try {
//           if (existsSync(filePath)) {
//             unlinkSync(filePath);
//             console.log(`🗑️ Error cleanup: ${filename}`);
//           }
//         } catch (deleteErr) {
//           console.error('Cleanup error:', deleteErr);
//         }
//       }, 5000);
//     });

//     // 🔥 PERFECT HEADERS FOR BROWSER PROGRESS BAR
//     const headers = new Headers({
//       // 📦 Basic file headers
//       'Content-Type': 'application/octet-stream',
//       'Content-Length': contentLength.toString(),
//       'Content-Disposition': `attachment; filename="${filename}"`,
      
//       // 🚀 ESSENTIAL FOR BROWSER PROGRESS
//       'Accept-Ranges': 'bytes',
//       'Content-Transfer-Encoding': 'binary',
      
//       // 📊 PROGRESS SUPPORT HEADERS
//       'Cache-Control': 'no-cache, no-store, must-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0',
      
//       // 🔄 CONNECTION HEADERS
//       'Connection': 'keep-alive',
//       'Keep-Alive': 'timeout=15, max=100',
      
//       // 🎯 BROWSER COMPATIBILITY
//       'X-Content-Type-Options': 'nosniff',
//       'X-Frame-Options': 'DENY',
      
//       // 🚀 NGINX OPTIMIZATION (if using nginx)
//       'X-Accel-Buffering': 'no',
      
//       // 📅 FILE INFO FOR RESUME SUPPORT
//       'Last-Modified': stat.mtime.toUTCString(),
//       'ETag': `"${stat.size}-${stat.mtime.getTime()}"`,
//     });

//     // 🔥 RANGE HEADER FOR PARTIAL CONTENT
//     if (rangeHeader) {
//       headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
//     }

//     console.log(`🚀 BROWSER-STREAMING: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB) - Range: ${start}-${end}`);

//     // 📊 RETURN WITH PROPER STATUS CODE
//     return new Response(stream as any, {
//       status: rangeHeader ? 206 : 200, // 206 for partial content, 200 for full
//       headers: headers,
//     });

//   } catch (error: any) {
//     console.error("❌ Download error:", error);
//     return new Response("Download failed", { status: 500 });
//   }
// }
// app/api/download/route.ts
import { NextRequest } from "next/server";
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

    // 🔥 ENHANCED RANGE SUPPORT
    let start = 0;
    let end = fileSize - 1;
    
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    }

    if (start >= fileSize || end >= fileSize || start > end) {
      return new Response("Range not satisfiable", { status: 416 });
    }

    const contentLength = end - start + 1;

    // 🚀 ULTRA-HIGH PERFORMANCE STREAM - 16MB chunks for maximum speed
    const stream = createReadStream(filePath, {
      start,
      end,
      highWaterMark: 16 * 1024 * 1024, // 16MB chunks for ultra speed
      flags: 'r',
      autoClose: true,
      emitClose: true
    });

    // 🗑️ SMART AUTO-DELETE
    stream.on('open', () => {
      console.log(`🚀 ULTRA-SPEED Download: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB)`);
      
      // Very conservative deletion - 15 seconds per MB, minimum 10 minutes
      const deleteTime = Math.max(600000, fileSize / (1024 * 1024) * 15000); 
      
      setTimeout(() => {
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
            console.log(`🗑️ Auto-deleted: ${filename} after ${Math.round(deleteTime/1000)}s`);
          }
        } catch (err) {
          console.error('Delete error:', err);
        }
      }, deleteTime);
    });

    // Error handling
    stream.on('error', (err) => {
      console.error("Stream error:", err);
      setTimeout(() => {
        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
            console.log(`🗑️ Error cleanup: ${filename}`);
          }
        } catch {}
      }, 60000);
    });

    // 🔥 OPTIMIZED HEADERS FOR BROWSER NATIVE PROGRESS
    const headers = new Headers();
    
    // 📦 Essential file headers
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    // 🚀 CRITICAL PROGRESS HEADERS
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Transfer-Encoding', 'binary');
    
    // 📊 CACHE CONTROL
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '-1');
    
    // 🔄 CONNECTION OPTIMIZATION
    headers.set('Connection', 'keep-alive');
    headers.set('Keep-Alive', 'timeout=600, max=1000');
    
    // 🎯 BROWSER COMPATIBILITY
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    
    // 📅 RESUME SUPPORT
    headers.set('Last-Modified', stat.mtime.toUTCString());
    headers.set('ETag', `"${stat.size.toString(16)}-${stat.mtime.getTime().toString(16)}"`);
    
    // 🚀 PERFORMANCE HEADERS
    headers.set('X-Accel-Buffering', 'no');
    headers.set('Vary', 'Accept-Encoding');

    // 🚨 CRITICAL: Content-Length based on request type
    if (rangeHeader) {
      headers.set('Content-Length', contentLength.toString());
      headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    } else {
      headers.set('Content-Length', fileSize.toString());
    }

    console.log(`🚀 ULTRA-STREAM: ${filename} (${(fileSize/1024/1024).toFixed(1)}MB) | 16MB chunks | Range: ${start}-${end}`);

    return new Response(stream as any, {
      status: rangeHeader ? 206 : 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error("❌ Download error:", error);
    return new Response("Download failed", { status: 500 });
  }
}
