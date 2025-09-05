import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const platform = detectPlatform(url);
    console.log("Free download for platform:", platform);

    let downloadData;

    switch (platform) {
      case "instagram":
        downloadData = await freeInstagramDownload(url);
        break;
      case "youtube":
        downloadData = await freeYouTubeDownload(url);
        break;
      case "facebook":
        downloadData = await freeFacebookDownload(url);
        break;
      default:
        return NextResponse.json(
          {
            error:
              "Unsupported platform. Supported: Instagram, YouTube, Facebook",
          },
          { status: 400 }
        );
    }

    return NextResponse.json(downloadData);
  } catch (error: any) {
    console.error("Free download error:", error);
    return NextResponse.json(
      { error: "Free download failed: " + error.message },
      { status: 500 }
    );
  }
}

function detectPlatform(url: string): string {
  const cleanUrl = url.toLowerCase().trim();

  if (cleanUrl.includes("instagram.com") || cleanUrl.includes("instagr.am")) {
    return "instagram";
  }
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    return "youtube";
  }
  if (
    cleanUrl.includes("facebook.com") ||
    cleanUrl.includes("fb.watch") ||
    cleanUrl.includes("fb.me")
  ) {
    return "facebook";
  }

  return "unknown";
}

// Free Instagram Download (No API Key Required)
async function freeInstagramDownload(url: string) {
  try {
    console.log("Free Instagram download for:", url);

    // Method 1: Try public Instagram scraper
    const scraperId = extractInstagramId(url);

    if (scraperId) {
      // Get basic info using Instagram's oembed (public API)
      try {
        const oembedResponse = await fetch(
          `https://www.instagram.com/oembed/?url=${encodeURIComponent(url)}`
        );

        if (oembedResponse.ok) {
          const oembedData = await oembedResponse.json();

          return {
            success: true,
            platform: "instagram",
            title: oembedData.title || "Instagram Content",
            thumbnail: oembedData.thumbnail_url,
            downloadUrl: url, // Original URL for external download
            type: "video",
            author: oembedData.author_name,
            message: "Use external tools for download",
            external_tools: [
              {
                name: "SaveIG",
                website: "https://saveig.app/",
                instruction: "Paste Instagram URL and download",
              },
              {
                name: "InstaDownloader",
                website: "https://instadownloader.co/",
                instruction: "Free Instagram video/photo downloader",
              },
              {
                name: "yt-dlp",
                command: `yt-dlp "${url}"`,
                website: "https://github.com/yt-dlp/yt-dlp",
              },
            ],
          };
        }
      } catch (e) {
        console.log("Instagram oembed failed:", e);
      }
    }

    // Fallback response
    return {
      success: true,
      platform: "instagram",
      title: "Instagram Content",
      thumbnail: "https://via.placeholder.com/300x300?text=Instagram+Content",
      downloadUrl: url,
      type: "video",
      message: "Free download - Use external tools",
      external_tools: [
        {
          name: "SaveIG",
          website: "https://saveig.app/",
          instruction: "Best free Instagram downloader",
        },
        {
          name: "InstaSave",
          website: "https://instasave.website/",
          instruction: "Download reels, photos, stories",
        },
      ],
    };
  } catch (error: any) {
    return {
      success: false,
      platform: "instagram",
      error: `Free Instagram download failed: ${error.message}`,
    };
  }
}

// Free YouTube Download (No API Key Required)
async function freeYouTubeDownload(url: string) {
  try {
    console.log("Free YouTube download for:", url);

    const videoId = extractYouTubeID(url);

    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Get video info from YouTube oEmbed API (free)
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`
    );

    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();

      return {
        success: true,
        platform: "youtube",
        title: oembedData.title || "YouTube Video",
        thumbnail:
          oembedData.thumbnail_url ||
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        downloadUrl: url,
        type: "video",
        author: oembedData.author_name,
        video_id: videoId,
        message: "Free download - Use external tools",
        external_tools: [
          {
            name: "yt-dlp (Best)",
            command: `yt-dlp "${url}"`,
            website: "https://github.com/yt-dlp/yt-dlp",
            instruction: "Most reliable YouTube downloader",
          },
          {
            name: "Y2Mate",
            website: "https://www.y2mate.com/",
            instruction: "Online YouTube to MP4/MP3 converter",
          },
          {
            name: "SaveFrom",
            website: "https://savefrom.net/",
            instruction: "Free online video downloader",
          },
          {
            name: "9xBuddy",
            website: "https://9xbuddy.org/",
            instruction: "Download videos from 900+ sites",
          },
        ],
      };
    }

    throw new Error("Could not fetch video info");
  } catch (error: any) {
    return {
      success: false,
      platform: "youtube",
      error: `Free YouTube download failed: ${error.message}`,
    };
  }
}

// Free Facebook Download (No API Key Required)
async function freeFacebookDownload(url: string) {
  try {
    console.log("Free Facebook download for:", url);

    return {
      success: true,
      platform: "facebook",
      title: "Facebook Video",
      thumbnail: "https://via.placeholder.com/300x200?text=Facebook+Video",
      downloadUrl: url,
      type: "video",
      message: "Free download - Use external tools",
      external_tools: [
        {
          name: "FBDown",
          website: "https://fbdown.net/",
          instruction: "Best free Facebook video downloader",
        },
        {
          name: "GetFVid",
          website: "https://www.getfvid.com/",
          instruction: "Download Facebook videos in HD",
        },
        {
          name: "yt-dlp",
          command: `yt-dlp "${url}"`,
          website: "https://github.com/yt-dlp/yt-dlp",
          instruction: "Command line tool for Facebook videos",
        },
        {
          name: "SaveFrom",
          website: "https://savefrom.net/",
          instruction: "Online Facebook video downloader",
        },
      ],
    };
  } catch (error: any) {
    return {
      success: false,
      platform: "facebook",
      error: `Free Facebook download failed: ${error.message}`,
    };
  }
}

// Utility Functions
function extractYouTubeID(url: string): string {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

function extractInstagramId(url: string): string {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

// Health check
export async function GET() {
  return NextResponse.json({
    message: "Free Social Media Downloader API",
    supportedPlatforms: ["Instagram", "YouTube", "Facebook"],
    version: "1.0.0-free",
    features: [
      "No API keys required",
      "All platforms supported",
      "External tool recommendations",
      "Basic video info extraction",
    ],
    status: "active",
  });
}
