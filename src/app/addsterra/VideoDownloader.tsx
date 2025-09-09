// components/VideoDownloader.tsx
"use client";

import { useState } from 'react';
import { SmartNativeAd } from './SmartNativeAd';

export function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [showAd, setShowAd] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    // 🔥 TRIGGER AD after user starts typing
    if (value.length > 10 && !showAd) {
      setShowAd(true);
    }
  };

  return (
    <div className="video-downloader">
      <div className="input-container">
        <input
          type="text"
          value={url}
          onChange={handleInputChange}
          placeholder="Paste video URL from any of 1000+ supported websites..."
          className="w-full p-4 rounded-lg bg-blue-900/30 border border-cyan-400/30 text-white"
        />
        
        <button className="download-btn mt-4 w-full bg-cyan-500 hover:bg-cyan-600 p-4 rounded-lg">
          Download Video ⚡
        </button>
      </div>

      {/* 🔥 AD AFTER INPUT - User engaged moment */}
      {showAd && (
        <SmartNativeAd 
          placement="input-field" 
          delay={1500}
          className="animate-slideIn"
        />
      )}
    </div>
  );
}
