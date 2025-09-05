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

    // Set proper headers for browser download
    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", stats.size.toString());
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "no-cache");

    // Delete file after streaming starts
    fileStream.on("end", async () => {
      try {
        await fs.unlink(filePath);
        console.log(`File deleted from server: ${filename}`);
      } catch (err) {
        console.error("Failed to delete file:", err);
      }
    });

    return new NextResponse(fileStream as any, { headers });
  } catch (error: any) {
    console.error("Download file error:", error);
    return new NextResponse("Download failed", { status: 500 });
  }
}
