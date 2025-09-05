import { NextRequest } from "next/server";
import { activeDownloads } from "../shared/downloads";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const downloadId = searchParams.get("id");

  console.log("🔍 SSE Request for:", downloadId);

  if (!downloadId) {
    return new Response("Missing download ID", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log("🚀 Starting SSE stream for:", downloadId);

      const sendData = (data: any) => {
        const sseData = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      };

      // Send initial data if download exists
      if (activeDownloads.has(downloadId)) {
        const download = activeDownloads.get(downloadId);
        console.log("📤 Initial progress:", download.progress.status);
        sendData(download.progress);
      } else {
        console.log("❌ Download not found:", downloadId);
        sendData({
          status: "not_found",
          message: "Download not found",
          error: "Download may have expired",
        });
        controller.close();
        return;
      }

      // Set up interval for progress updates
      const interval = setInterval(() => {
        if (activeDownloads.has(downloadId)) {
          const currentDownload = activeDownloads.get(downloadId);
          console.log(
            `📊 Progress: ${currentDownload.progress.percentage}% - ${currentDownload.progress.status}`
          );
          sendData(currentDownload.progress);

          // Clean up if complete
          if (
            currentDownload.progress.status === "completed" ||
            currentDownload.progress.status === "error"
          ) {
            console.log("✅ Download finished, cleaning up");
            clearInterval(interval);
            controller.close();

            // Clean up after 30 seconds
            setTimeout(() => {
              activeDownloads.delete(downloadId);
              console.log("🗑️ Deleted from memory:", downloadId);
            }, 30000);
          }
        } else {
          console.log("❌ Download disappeared");
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Handle client disconnect
      request.signal.addEventListener("abort", () => {
        console.log("🔌 Client disconnected");
        clearInterval(interval);
        controller.close();
      });
    },

    cancel() {
      console.log("🛑 Stream cancelled");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
