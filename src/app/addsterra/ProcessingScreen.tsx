// components/ProcessingScreen.tsx
"use client";

import { SmartNativeAd } from './SmartNativeAd';

export function ProcessingScreen() {
  return (
    <div className="processing-screen text-center">
      <div className="loading-animation mb-6">
        <div className="spinner"></div>
        <h2 className="text-xl text-white mt-4">Processing Your Video...</h2>
        <p className="text-blue-200">This may take 10-30 seconds</p>
      </div>

      {/* 🔥 WAIT TIME MONETIZATION - Perfect timing */}
      <SmartNativeAd 
        placement="processing-wait"
        delay={3000}
      />

      <div className="progress-info mt-6">
        <p className="text-cyan-300">⚡ Analyzing video quality...</p>
        <p className="text-cyan-300">🎥 Preparing download formats...</p>
        <p className="text-cyan-300">🌊 Almost ready!</p>
      </div>
    </div>
  );
}
