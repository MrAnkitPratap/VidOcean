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
// import { NextRequest } from "next/server";
// import { createReadStream, statSync, existsSync, unlinkSync } from "fs";
// import path from "path";

// // Per-file delayed deletion scheduler
// const deleteTimers = new Map<string, NodeJS.Timeout>();
// const DELETE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const filename = searchParams.get("filename");
//     if (!filename) return new Response("Filename parameter missing", { status: 400 });

//     const filePath = path.join(process.cwd(), "public", "downloads", filename);
//     if (!existsSync(filePath)) return new Response("File not found", { status: 404 });

//     const st = statSync(filePath);
//     const fileSize = st.size;

//     // Stable validators for resume
//     const eTag = `"${fileSize.toString(16)}-${st.mtimeMs.toString(16)}"`;
//     const lastModified = st.mtime.toUTCString();

//     // Cancel any pending deletion while serving again (enables resume)
//     const t = deleteTimers.get(filePath);
//     if (t) clearTimeout(t);

//     // Parse Range
//     let start = 0;
//     let end = fileSize - 1;
//     const rangeHeader = request.headers.get("range") || request.headers.get("Range");
//     if (rangeHeader) {
//       const m = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
//       if (m) {
//         if (m[1] !== "") start = Math.min(parseInt(m[1], 10), fileSize - 1);
//         if (m[22] !== "") end = Math.min(parseInt(m[22], 10), fileSize - 1);
//       }
//     }
//     if (start > end || start < 0 || end >= fileSize) {
//       return new Response("Range not satisfiable", { status: 416, headers: { "Content-Range": `bytes */${fileSize}` } });
//     }

//     // If-Range handling: if validator mismatches, ignore range and send full 200
//     const ifRange = request.headers.get("if-range");
//     const useRange =
//       !ifRange ||
//       ifRange === eTag ||
//       ifRange === lastModified; // only honor range if validators match

//     const isPartial = !!rangeHeader && useRange && (start !== 0 || end !== fileSize - 1);
//     const contentLength = isPartial ? (end - start + 1) : fileSize;

//     // High throughput stream: 8–16MB chunk
//     const stream = createReadStream(filePath, {
//       start: isPartial ? start : 0,
//       end: isPartial ? end : fileSize - 1,
//       highWaterMark: 8 * 1024 * 1024, // 8MB; bump to 16MB if NIC is very fast
//       flags: "r",
//       autoClose: true,
//     });

//     // Schedule safe delayed deletion after stream closes
//     stream.on("close", () => {
//       const timer = setTimeout(() => {
//         try {
//           if (existsSync(filePath)) unlinkSync(filePath);
//         } catch {}
//       }, DELETE_TTL_MS);
//       deleteTimers.set(filePath, timer);
//     });

//     stream.on("error", () => {
//       // On error, still schedule cleanup (shorter delay to free space but not immediate)
//       const timer = setTimeout(() => {
//         try {
//           if (existsSync(filePath)) unlinkSync(filePath);
//         } catch {}
//       }, 5 * 60 * 1000);
//       deleteTimers.set(filePath, timer);
//     });

//     const headers = new Headers();
//     headers.set("Content-Type", "application/octet-stream");
//     headers.set("Content-Disposition", `attachment; filename="${filename}"`);
//     headers.set("Accept-Ranges", "bytes");
//     headers.set("Cache-Control", "no-store, max-age=0");
//     headers.set("ETag", eTag);
//     headers.set("Last-Modified", lastModified);
//     headers.set("Connection", "keep-alive");
//     headers.set("X-Content-Type-Options", "nosniff");
//     // Progress-critical lengths
//     headers.set("Content-Length", contentLength.toString());
//     if (isPartial) headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);

//     return new Response(stream as any, {
//       status: isPartial ? 206 : 200,
//       headers,
//     });
//   } catch (e: any) {
//     return new Response("Download failed", { status: 500 });
//   }
// }

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

import { NextRequest } from "next/server";
import {
  createReadStream,
  statSync,
  existsSync,
  unlinkSync,
  readdirSync,
} from "fs";
import path from "path";

// 🗂️ ENHANCED FILE CLEANUP SYSTEM
const fileCleanupTimers = new Map<string, NodeJS.Timeout>();
const fileAccessLog = new Map<
  string,
  { lastAccess: number; downloadCount: number }
>();
const DELETE_TTL_MS = 60 * 60 * 1000; // 🔥 Extended to 1 hour (was 30 min)
const MAX_DOWNLOADS_PER_FILE = 10; // Increased from 5 to 10
const CLEANUP_CHECK_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes

// 🧹 PERIODIC CLEANUP SYSTEM
setInterval(() => {
  performPeriodicCleanup();
}, CLEANUP_CHECK_INTERVAL);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      console.log("❌ No filename parameter provided");
      return new Response("Filename parameter missing", { status: 400 });
    }

    console.log(`📥 Download request for: ${filename}`);

    const filePath = path.join(process.cwd(), "public", "downloads", filename);

    if (!existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);

      // 🔍 DEBUG: Show available files
      try {
        const downloadsDir = path.join(process.cwd(), "public", "downloads");
        const files = readdirSync(downloadsDir);
        console.log(
          `📂 Available files (${files.length}):`,
          files.slice(0, 10)
        );

        // Try to find similar files
        const similarFiles = files.filter(
          (file) =>
            file.toLowerCase().includes(filename.toLowerCase().split("_")[0]) ||
            filename.toLowerCase().includes(file.toLowerCase().split("_")[0])
        );
        console.log(`🔍 Similar files found:`, similarFiles);
      } catch (debugError) {
        console.log("Debug info failed:", debugError.message);
      }

      return new Response("File not found or expired", { status: 404 });
    }

    // 📊 FILE STATISTICS & VALIDATION
    let st;
    try {
      st = statSync(filePath);
    } catch (error) {
      console.log(`❌ Cannot access file stats: ${filename}`, error.message);
      return new Response("File access error", { status: 500 });
    }

    const fileSize = st.size;

    // 🛡️ FILE SIZE VALIDATION
    if (fileSize === 0) {
      console.log(`❌ Empty file detected: ${filename}`);
      safeDeleteFile(filePath);
      return new Response("File is empty or corrupted", { status: 404 });
    }

    if (fileSize < 1024) {
      // Less than 1KB
      console.log(
        `⚠️ Suspiciously small file: ${filename} (${fileSize} bytes)`
      );
    }

    console.log(
      `✅ File found: ${filename} (${(fileSize / 1024 / 1024).toFixed(1)}MB)`
    );

    // 🔒 ENHANCED CACHE VALIDATORS
    const eTag = `"${fileSize.toString(16)}-${st.mtimeMs.toString(
      16
    )}-${filename.replace(/[^a-zA-Z0-9]/g, "")}"`;
    const lastModified = st.mtime.toUTCString();

    // 📈 UPDATE ACCESS TRACKING
    updateFileAccess(filename, filePath);

    // 🔄 CANCEL PENDING DELETION (Important!)
    if (fileCleanupTimers.has(filePath)) {
      clearTimeout(fileCleanupTimers.get(filePath)!);
      fileCleanupTimers.delete(filePath);
      console.log(`🔄 Cancelled cleanup for active download: ${filename}`);
    }

    // 📥 ENHANCED RANGE REQUEST HANDLING
    let start = 0;
    let end = fileSize - 1;
    let isPartialContent = false;

    const rangeHeader =
      request.headers.get("range") || request.headers.get("Range");

    if (rangeHeader) {
      console.log(`📥 Range request: ${rangeHeader}`);
      const rangeMatch = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (rangeMatch) {
        const startStr = rangeMatch[1];
        const endStr = rangeMatch[2];

        if (startStr) start = Math.min(parseInt(startStr, 10), fileSize - 1);
        if (endStr) end = Math.min(parseInt(endStr, 10), fileSize - 1);

        // Validate range
        if (start > end || start < 0 || end >= fileSize) {
          console.log(`❌ Invalid range: ${start}-${end}/${fileSize}`);
          return new Response("Range not satisfiable", {
            status: 416,
            headers: {
              "Content-Range": `bytes */${fileSize}`,
              "Content-Type": "application/octet-stream",
            },
          });
        }

        isPartialContent = true;
        console.log(`📥 Valid range request: ${start}-${end}/${fileSize}`);
      }
    }

    // 🔍 IF-RANGE VALIDATION
    const ifRange = request.headers.get("if-range");
    if (ifRange && isPartialContent) {
      if (ifRange !== eTag && ifRange !== lastModified) {
        start = 0;
        end = fileSize - 1;
        isPartialContent = false;
        console.log(`🔄 If-Range mismatch, sending full file: ${filename}`);
      }
    }

    const contentLength = isPartialContent ? end - start + 1 : fileSize;

    // 🚀 OPTIMIZED FILE STREAM
    const streamOptions = {
      start: start,
      end: end,
      highWaterMark: determineOptimalChunkSize(fileSize),
      flags: "r",
      autoClose: true,
      emitClose: true,
    };

    console.log(
      `📤 Starting stream: ${filename} (${start}-${end}/${fileSize}) | Chunk: ${
        streamOptions.highWaterMark / 1024 / 1024
      }MB`
    );

    const stream = createReadStream(filePath, streamOptions);

    // 🎯 ENHANCED STREAM EVENT HANDLERS
    let streamClosed = false;
    let downloadCompleted = false;
    let bytesTransferred = 0;

    stream.on("open", () => {
      console.log(`📂 Stream opened: ${filename} (${contentLength} bytes)`);
    });

    stream.on("data", (chunk) => {
      bytesTransferred += chunk.length;
    });

    stream.on("close", () => {
      if (streamClosed) return;
      streamClosed = true;
      downloadCompleted = bytesTransferred >= contentLength * 0.95; // 95% threshold

      console.log(
        `📤 Stream closed: ${filename} | Completed: ${downloadCompleted} | Transferred: ${bytesTransferred}/${contentLength} (${(
          (bytesTransferred / contentLength) *
          100
        ).toFixed(1)}%)`
      );

      if (downloadCompleted) {
        // Schedule normal cleanup after successful download
        scheduleFileCleanup(filePath, DELETE_TTL_MS);
      } else {
        // Stream was interrupted, schedule faster cleanup
        scheduleFileCleanup(filePath, 10 * 60 * 1000); // 10 minutes
      }
    });

    stream.on("error", (error) => {
      if (streamClosed) return;
      streamClosed = true;
      console.error(`💥 Stream error for ${filename}:`, error.message);

      // Schedule immediate cleanup on stream error
      scheduleFileCleanup(filePath, 5 * 60 * 1000); // 5 minutes
    });

    // 🏷️ COMPREHENSIVE RESPONSE HEADERS
    const headers = new Headers();

    // Content headers
    headers.set("Content-Type", "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${sanitizeFilename(filename)}"`
    );
    headers.set("Content-Length", contentLength.toString());

    // Range and caching headers
    headers.set("Accept-Ranges", "bytes");
    headers.set("ETag", eTag);
    headers.set("Last-Modified", lastModified);

    if (isPartialContent) {
      headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    }

    // Performance and security headers
    headers.set("Cache-Control", "private, max-age=3600, must-revalidate"); // 1 hour cache
    headers.set("Connection", "keep-alive");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("X-Download-Options", "noopen");

    // Custom headers for tracking
    headers.set("X-File-Size", fileSize.toString());
    headers.set("X-Download-ID", generateDownloadId());
    headers.set("X-Server-Time", Date.now().toString());

    const status = isPartialContent ? 206 : 200;

    console.log(
      `✅ Serving ${filename}: ${contentLength} bytes (${status}) | Range: ${
        isPartialContent ? "Yes" : "No"
      }`
    );

    return new Response(stream as any, {
      status: status,
      headers: headers,
    });
  } catch (error: any) {
    console.error("💥 Download file error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// 🧹 ENHANCED CLEANUP FUNCTIONS
function scheduleFileCleanup(filePath: string, delay: number) {
  // Cancel existing timer
  if (fileCleanupTimers.has(filePath)) {
    clearTimeout(fileCleanupTimers.get(filePath)!);
  }

  const timer = setTimeout(() => {
    safeDeleteFile(filePath);
    fileCleanupTimers.delete(filePath);
  }, delay);

  fileCleanupTimers.set(filePath, timer);

  const filename = path.basename(filePath);
  console.log(
    `⏰ Scheduled cleanup for ${filename} in ${(delay / 1000 / 60).toFixed(
      1
    )} minutes`
  );
}

function safeDeleteFile(filePath: string) {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      const filename = path.basename(filePath);
      console.log(`🗑️ Deleted file: ${filename}`);

      // Clean up tracking
      fileAccessLog.delete(filename);

      return true;
    }
  } catch (error: any) {
    console.error(`❌ Failed to delete file ${filePath}:`, error.message);
  }
  return false;
}

function updateFileAccess(filename: string, filePath: string) {
  const now = Date.now();
  const access = fileAccessLog.get(filename) || {
    lastAccess: now,
    downloadCount: 0,
  };

  access.lastAccess = now;
  access.downloadCount++;

  fileAccessLog.set(filename, access);

  console.log(
    `📊 File access: ${filename} | Count: ${access.downloadCount}/${MAX_DOWNLOADS_PER_FILE}`
  );

  // 🚨 IMMEDIATE CLEANUP for heavily accessed files
  if (access.downloadCount >= MAX_DOWNLOADS_PER_FILE) {
    console.log(
      `🚨 File ${filename} reached max downloads (${access.downloadCount}), scheduling cleanup`
    );
    scheduleFileCleanup(filePath, 60 * 1000); // 1 minute
  }
}

function performPeriodicCleanup() {
  try {
    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    if (!existsSync(downloadsDir)) return;

    const files = readdirSync(downloadsDir);
    const now = Date.now();
    let cleanedCount = 0;
    let totalSize = 0;

    console.log(`🧹 Starting periodic cleanup of ${files.length} files`);

    for (const filename of files) {
      const filePath = path.join(downloadsDir, filename);

      try {
        const stats = statSync(filePath);
        const age = now - stats.mtimeMs;
        const fileSize = stats.size;
        totalSize += fileSize;
        const ageHours = age / (1000 * 60 * 60);

        // Delete old files (older than 3 hours)
        if (age > 3 * 60 * 60 * 1000) {
          console.log(
            `🗑️ Deleting old file: ${filename} (${ageHours.toFixed(
              1
            )} hours old)`
          );
          if (safeDeleteFile(filePath)) {
            cleanedCount++;
          }
          continue;
        }

        // Delete empty or very small files immediately
        if (fileSize < 1024) {
          console.log(
            `🗑️ Deleting small/empty file: ${filename} (${fileSize} bytes)`
          );
          if (safeDeleteFile(filePath)) {
            cleanedCount++;
          }
          continue;
        }

        // Delete temp files after 30 minutes
        if (
          (filename.includes("temp") || filename.includes("partial")) &&
          age > 30 * 60 * 1000
        ) {
          console.log(`🗑️ Deleting temp file: ${filename}`);
          if (safeDeleteFile(filePath)) {
            cleanedCount++;
          }
        }
      } catch (error) {
        console.log(`⚠️ Problem with file ${filename}, attempting deletion`);
        if (safeDeleteFile(filePath)) {
          cleanedCount++;
        }
      }
    }

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
    console.log(
      `🧹 Cleanup complete: ${cleanedCount} files deleted, ${
        files.length - cleanedCount
      } remaining (${totalSizeMB}MB total)`
    );

    // 🚨 DISK SPACE PROTECTION
    if (totalSize > 8 * 1024 * 1024 * 1024) {
      // 8GB
      console.log(
        `🚨 Disk usage high (${totalSizeMB}MB), performing aggressive cleanup`
      );
      performAggressiveCleanup();
    }
  } catch (error) {
    console.error("💥 Periodic cleanup error:", error);
  }
}

function performAggressiveCleanup() {
  try {
    const downloadsDir = path.join(process.cwd(), "public", "downloads");
    const files = readdirSync(downloadsDir);
    const now = Date.now();

    // Sort by age (oldest first)
    const filesByAge = files
      .map((filename) => {
        const filePath = path.join(downloadsDir, filename);
        const stats = statSync(filePath);
        return {
          filename,
          filePath,
          age: now - stats.mtimeMs,
          size: stats.size,
        };
      })
      .sort((a, b) => b.age - a.age);

    // Delete oldest 50% of files
    const deleteCount = Math.ceil(filesByAge.length / 2);
    let deleted = 0;

    for (let i = 0; i < deleteCount && i < filesByAge.length; i++) {
      if (safeDeleteFile(filesByAge[i].filePath)) {
        deleted++;
      }
    }

    console.log(
      `🚨 Aggressive cleanup: deleted ${deleted}/${deleteCount} files`
    );
  } catch (error) {
    console.error("💥 Aggressive cleanup error:", error);
  }
}

// 🔧 UTILITY FUNCTIONS
function determineOptimalChunkSize(fileSize: number): number {
  // Dynamic chunk sizing based on file size for optimal performance
  if (fileSize < 10 * 1024 * 1024) return 2 * 1024 * 1024; // 2MB for small files
  if (fileSize < 100 * 1024 * 1024) return 8 * 1024 * 1024; // 8MB for medium files
  if (fileSize < 500 * 1024 * 1024) return 16 * 1024 * 1024; // 16MB for large files
  return 32 * 1024 * 1024; // 32MB for very large files
}

function sanitizeFilename(filename: string): string {
  // Remove potentially problematic characters
  return filename.replace(/[^a-zA-Z0-9._\-\s]/g, "_");
}

function generateDownloadId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

// 📊 MONITORING ENDPOINT (Optional)
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "cleanup_status") {
      const downloadsDir = path.join(process.cwd(), "public", "downloads");
      let fileCount = 0;
      let totalSize = 0;

      if (existsSync(downloadsDir)) {
        const files = readdirSync(downloadsDir);
        fileCount = files.length;

        for (const filename of files) {
          try {
            const stats = statSync(path.join(downloadsDir, filename));
            totalSize += stats.size;
          } catch (error) {
            // Skip problematic files
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: {
            activeFiles: fileCount,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(1),
            scheduledCleanups: fileCleanupTimers.size,
            trackedFiles: fileAccessLog.size,
            maxDownloadsPerFile: MAX_DOWNLOADS_PER_FILE,
            cleanupIntervalMinutes: CLEANUP_CHECK_INTERVAL / (1000 * 60),
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (action === "force_cleanup") {
      performPeriodicCleanup();
      return new Response(
        JSON.stringify({
          success: true,
          message: "Manual cleanup initiated",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid action",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
