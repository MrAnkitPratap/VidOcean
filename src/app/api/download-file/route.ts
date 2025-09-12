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

// Per-file delayed deletion scheduler
const deleteTimers = new Map<string, NodeJS.Timeout>();
const DELETE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    if (!filename) return new Response("Filename parameter missing", { status: 400 });

    const filePath = path.join(process.cwd(), "public", "downloads", filename);
    if (!existsSync(filePath)) return new Response("File not found", { status: 404 });

    const st = statSync(filePath);
    const fileSize = st.size;

    // Stable validators for resume
    const eTag = `"${fileSize.toString(16)}-${st.mtimeMs.toString(16)}"`;
    const lastModified = st.mtime.toUTCString();

    // Cancel any pending deletion while serving again (enables resume)
    const t = deleteTimers.get(filePath);
    if (t) clearTimeout(t);

    // Parse Range
    let start = 0;
    let end = fileSize - 1;
    const rangeHeader = request.headers.get("range") || request.headers.get("Range");
    if (rangeHeader) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (m) {
        if (m[1] !== "") start = Math.min(parseInt(m[1], 10), fileSize - 1);
        if (m[22] !== "") end = Math.min(parseInt(m[22], 10), fileSize - 1);
      }
    }
    if (start > end || start < 0 || end >= fileSize) {
      return new Response("Range not satisfiable", { status: 416, headers: { "Content-Range": `bytes */${fileSize}` } });
    }

    // If-Range handling: if validator mismatches, ignore range and send full 200
    const ifRange = request.headers.get("if-range");
    const useRange =
      !ifRange ||
      ifRange === eTag ||
      ifRange === lastModified; // only honor range if validators match

    const isPartial = !!rangeHeader && useRange && (start !== 0 || end !== fileSize - 1);
    const contentLength = isPartial ? (end - start + 1) : fileSize;

    // High throughput stream: 8–16MB chunk
    const stream = createReadStream(filePath, {
      start: isPartial ? start : 0,
      end: isPartial ? end : fileSize - 1,
      highWaterMark: 8 * 1024 * 1024, // 8MB; bump to 16MB if NIC is very fast
      flags: "r",
      autoClose: true,
    });

    // Schedule safe delayed deletion after stream closes
    stream.on("close", () => {
      const timer = setTimeout(() => {
        try {
          if (existsSync(filePath)) unlinkSync(filePath);
        } catch {}
      }, DELETE_TTL_MS);
      deleteTimers.set(filePath, timer);
    });

    stream.on("error", () => {
      // On error, still schedule cleanup (shorter delay to free space but not immediate)
      const timer = setTimeout(() => {
        try {
          if (existsSync(filePath)) unlinkSync(filePath);
        } catch {}
      }, 5 * 60 * 1000);
      deleteTimers.set(filePath, timer);
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "no-store, max-age=0");
    headers.set("ETag", eTag);
    headers.set("Last-Modified", lastModified);
    headers.set("Connection", "keep-alive");
    headers.set("X-Content-Type-Options", "nosniff");
    // Progress-critical lengths
    headers.set("Content-Length", contentLength.toString());
    if (isPartial) headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);

    return new Response(stream as any, {
      status: isPartial ? 206 : 200,
      headers,
    });
  } catch (e: any) {
    return new Response("Download failed", { status: 500 });
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { createReadStream, promises as fs } from "fs";
// import path from "path";

// // 🎯 Track active downloads per file
// const activeFileDownloads = new Map<string, number>();
// const downloadCompletionCallbacks = new Map<string, NodeJS.Timeout[]>();

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
//     const fileSize = stats.size;

//     // 📊 Track this download
//     const currentCount = activeFileDownloads.get(filename) || 0;
//     activeFileDownloads.set(filename, currentCount + 1);

//     console.log(`📥 Starting download: ${filename} (Active: ${currentCount + 1})`);

//     // 🔥 Handle Range Requests for Resume/Pause functionality
//     const rangeHeader = request.headers.get("range");

//     if (rangeHeader) {
//       // Parse range header
//       const parts = rangeHeader.replace(/bytes=/, "").split("-");
//       const start = parseInt(parts[0], 10);
//       const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
//       const chunkSize = (end - start) + 1;

//       // Create partial stream with error handling
//       const fileStream = createReadStream(filePath, { start, end });

//       // 🚨 Handle stream errors
//       fileStream.on('error', (error) => {
//         console.error(`Stream error for ${filename}:`, error);
//         decrementDownloadCounter(filename);
//       });

//       // 📝 Track completion for partial downloads
//       fileStream.on('close', () => {
//         console.log(`📤 Partial download chunk completed: ${filename} (${start}-${end})`);

//         // 🏁 If this was the final chunk, mark as complete
//         if (end === fileSize - 1) {
//           console.log(`✅ Final chunk downloaded: ${filename}`);
//           scheduleSmartFileDeletion(filePath, filename);
//         }

//         decrementDownloadCounter(filename);
//       });

//       // Set partial content headers
//       const headers = new Headers();
//       headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
//       headers.set("Accept-Ranges", "bytes");
//       headers.set("Content-Length", chunkSize.toString());
//       headers.set("Content-Type", "application/octet-stream");
//       headers.set("Content-Disposition", `attachment; filename="${filename}"`);
//       headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
//       headers.set("Pragma", "no-cache");
//       headers.set("Expires", "0");

//       console.log(`📋 Resuming download: ${filename} (${start}-${end}/${fileSize})`);

//       return new NextResponse(fileStream as any, {
//         status: 206, // Partial Content
//         headers
//       });
//     } else {
//       // 🚀 Full file download with optimized headers
//       const fileStream = createReadStream(filePath, {
//         highWaterMark: 128 * 1024 // 128KB chunks for better performance
//       });

//       // 🚨 Handle stream errors
//       fileStream.on('error', (error) => {
//         console.error(`Stream error for ${filename}:`, error);
//         decrementDownloadCounter(filename);
//       });

//       // 📝 Track completion
//       fileStream.on('close', () => {
//         console.log(`✅ Full download completed: ${filename}`);
//         scheduleSmartFileDeletion(filePath, filename);
//         decrementDownloadCounter(filename);
//       });

//       const headers = new Headers();
//       headers.set("Content-Type", "application/octet-stream");
//       headers.set("Content-Length", fileSize.toString());
//       headers.set("Content-Disposition", `attachment; filename="${filename}"`);
//       headers.set("Accept-Ranges", "bytes"); // Enable resume support
//       headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
//       headers.set("Pragma", "no-cache");
//       headers.set("Expires", "0");

//       // 🔧 Performance optimization headers
//       headers.set("Connection", "keep-alive");
//       headers.set("Keep-Alive", "timeout=10, max=1000");

//       console.log(`🚀 Starting full download: ${filename} (${(fileSize / 1024 / 1024).toFixed(1)}MB)`);

//       return new NextResponse(fileStream as any, { headers });
//     }
//   } catch (error: any) {
//     console.error("💥 Download file error:", error);
//     return new NextResponse("Download failed", { status: 500 });
//   }
// }

// // 📉 Decrement download counter
// function decrementDownloadCounter(filename: string) {
//   const currentCount = activeFileDownloads.get(filename) || 0;
//   if (currentCount <= 1) {
//     activeFileDownloads.delete(filename);
//     console.log(`📊 No more active downloads for: ${filename}`);
//   } else {
//     activeFileDownloads.set(filename, currentCount - 1);
//     console.log(`📊 Active downloads for ${filename}: ${currentCount - 1}`);
//   }
// }

// // 🧠 Smart file deletion - only when no active downloads
// function scheduleSmartFileDeletion(filePath: string, filename: string) {
//   // Wait a bit for any pending downloads to start
//   const cleanupTimeout = setTimeout(async () => {
//     try {
//       // Check if there are still active downloads
//       const activeCount = activeFileDownloads.get(filename) || 0;
//       if (activeCount > 0) {
//         console.log(`⏳ Postponing deletion - ${activeCount} active downloads: ${filename}`);
//         // Reschedule for later
//         scheduleSmartFileDeletion(filePath, filename);
//         return;
//       }

//       // Check if file still exists
//       await fs.access(filePath);
//       await fs.unlink(filePath);
//       console.log(`🗑️ File deleted from server: ${filename}`);

//       // Clear any pending callbacks
//       clearCompletionCallbacks(filename);

//     } catch (err) {
//       console.log(`📁 File already removed: ${filename}`);
//     }
//   }, 10000); // 10 seconds delay

//   // Store cleanup callback for potential cancellation
//   if (!downloadCompletionCallbacks.has(filename)) {
//     downloadCompletionCallbacks.set(filename, []);
//   }
//   downloadCompletionCallbacks.get(filename)!.push(cleanupTimeout);
// }

// // 🧹 Clear completion callbacks
// function clearCompletionCallbacks(filename: string) {
//   const callbacks = downloadCompletionCallbacks.get(filename);
//   if (callbacks) {
//     callbacks.forEach(callback => clearTimeout(callback));
//     downloadCompletionCallbacks.delete(filename);
//   }
// }

// // 🕒 Enhanced cleanup function - runs periodically
// export async function cleanupOldFiles() {
//   const downloadDir = path.join(process.cwd(), "public", "downloads");

//   try {
//     const files = await fs.readdir(downloadDir);
//     const now = Date.now();

//     for (const file of files) {
//       const filePath = path.join(downloadDir, file);
//       const stats = await fs.stat(filePath);

//       // Only delete files older than 10 minutes AND no active downloads
//       const ageMinutes = (now - stats.mtime.getTime()) / 1000 / 60;
//       const activeCount = activeFileDownloads.get(file) || 0;

//       if (ageMinutes > 10 && activeCount === 0) {
//         await fs.unlink(filePath);
//         console.log(`🗑️ Cleaned up old file: ${file} (${ageMinutes.toFixed(1)}min old)`);
//         clearCompletionCallbacks(file);
//       }
//     }
//   } catch (error) {
//     console.error("💥 Cleanup error:", error);
//   }
// }

// // 🔄 Export active downloads for monitoring
// export { activeFileDownloads };
