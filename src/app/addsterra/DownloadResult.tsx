// components/DownloadResult.tsx
"use client";

import { SmartNativeAd } from './SmartNativeAd';

export function DownloadResult({ videoData } : any) {
  return (
    <div className="download-result">
      <h2 className="text-2xl font-bold text-white mb-4">
        🎉 Video Ready for Download!
      </h2>
      
      {/* Video Preview */}
      <div className="video-preview mb-6">
        <img src={videoData.thumbnail} alt="Video thumbnail" />
        <h3>{videoData.title}</h3>
      </div>

      {/* 🔥 PRE-DOWNLOAD AD - Highest converting placement */}
      <SmartNativeAd 
        placement="pre-download"
        className="mb-6"
      />

      {/* Download Options */}
      <div className="download-options">
        <button className="download-btn-primary">
          📥 Download MP4 (1080p) - 45.2 MB
        </button>
        <button className="download-btn-secondary">
          📥 Download MP4 (720p) - 28.1 MB
        </button>
      </div>

      {/* 🔥 POST-CLICK AD - After download starts */}
      <SmartNativeAd 
        placement="download-button"
        delay={2000}
        className="mt-6"
      />
    </div>
  );
}
