// components/ads/SmartNativeAd.tsx
"use client";

import { useEffect, useState } from "react";

interface SmartNativeAdProps {
  placement:
    | "mobile-hero"
    | "mobile-input"
    | "tablet-content"
    | "desktop-sidebar"
    | "desktop-content"
    | "input-field"
    | "download-button"
    | "processing-wait"
    | "pre-download";
  delay?: number;
  triggerOnScroll?: boolean;
  triggerOnInput?: boolean;
  className?: string;
}

export function SmartNativeAd({
  placement,
  delay = 0,
  triggerOnScroll = false,
  triggerOnInput = false,
  className = "",
}: SmartNativeAdProps) {
  const [isVisible, setIsVisible] = useState(
    !delay && !triggerOnScroll && !triggerOnInput
  );
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Delay logic
    if (delay > 0) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }

    // Scroll trigger logic
    if (triggerOnScroll) {
      const handleScroll = () => {
        const scrolled = window.scrollY > 200;
        if (scrolled && !isVisible) {
          setIsVisible(true);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }

    // Input trigger logic
    if (triggerOnInput) {
      const handleInputChange = () => {
        setIsVisible(true);
      };

      const inputElements = document.querySelectorAll(
        'input[type="text"], input[type="url"]'
      );
      inputElements.forEach((input) => {
        input.addEventListener("input", handleInputChange);
      });

      return () => {
        inputElements.forEach((input) => {
          input.removeEventListener("input", handleInputChange);
        });
      };
    }
  }, [delay, triggerOnScroll, triggerOnInput, isVisible]);

  // Placement-specific styling
  const getPlacementStyle = () => {
    const styles = {
      "mobile-hero": "block md:hidden my-6 px-4",
      "mobile-input": "block md:hidden mt-4 mb-6 px-4",
      "tablet-content": "hidden md:block lg:hidden my-8",
      "desktop-sidebar": "hidden lg:block sticky top-24",
      "desktop-content": "hidden lg:block my-12",

      // 🔥 NEW HIGH-CONVERTING PLACEMENTS
      "input-field": "my-4 px-4 w-full animate-fadeIn",
      "download-button": "my-6 px-4 w-full",
      "processing-wait": "my-8 px-4 w-full text-center",
      "pre-download":
        "my-6 px-4 w-full border-2 border-green-400/30 rounded-lg",
    };
    return styles[placement] || "";
  };

  const getContainerStyle = () => {
    const containers = {
      "mobile-hero":
        "bg-gradient-to-r from-blue-900/30 to-cyan-900/30 backdrop-blur-md rounded-xl border border-cyan-400/20 p-4",
      "mobile-input":
        "bg-white/5 backdrop-blur-sm rounded-lg border border-blue-400/30 p-3",
      "tablet-content":
        "bg-gradient-to-br from-blue-800/20 to-cyan-800/20 backdrop-blur-lg rounded-2xl border border-cyan-500/30 p-6 max-w-2xl mx-auto",
      "desktop-sidebar":
        "bg-gradient-to-b from-blue-900/40 to-cyan-900/40 backdrop-blur-xl rounded-2xl border border-cyan-400/30 p-6 shadow-2xl w-80",
      "desktop-content":
        "bg-white/5 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4",

      // 🔥 NEW HIGH-ENGAGEMENT CONTAINERS
      "input-field":
        "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-md rounded-lg border border-cyan-400/30 p-4 shadow-lg",
      "download-button":
        "bg-gradient-to-r from-green-900/30 to-cyan-900/30 backdrop-blur-lg rounded-xl border border-green-400/40 p-5 shadow-xl",
      "processing-wait":
        "bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-md rounded-xl border border-purple-400/30 p-6",
      "pre-download":
        "bg-gradient-to-br from-green-800/20 to-cyan-800/20 backdrop-blur-lg rounded-2xl border border-green-400/40 p-6 shadow-2xl",
    };
    return containers[placement] || "";
  };

  const getPlacementHeader = () => {
    const headers = {
      "mobile-hero": (
        <div className="text-center mb-3">
          <span className="text-cyan-300 text-xs font-medium">
            🌊 Sponsored
          </span>
        </div>
      ),
      "tablet-content": (
        <div className="text-center mb-4">
          <h4 className="text-cyan-300 font-semibold text-sm">
            🎥 Discover More Video Tools
          </h4>
          <p className="text-blue-200 text-xs mt-1">
            Enhanced downloading experience
          </p>
        </div>
      ),
      "desktop-sidebar": (
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-3">
            <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-900 text-sm font-bold">V</span>
            </div>
            <span className="text-white font-bold">vidocean Pro</span>
          </div>
          <p className="text-cyan-200 text-sm">Enhanced Features Available</p>
        </div>
      ),

      // 🔥 NEW HIGH-CONVERTING HEADERS
      "input-field": (
        <div className="text-center mb-3">
          <span className="text-cyan-300 text-sm font-medium">
            ⚡ While we process your link...
          </span>
          <p className="text-blue-200 text-xs mt-1">
            Discover more amazing tools
          </p>
        </div>
      ),
      "download-button": (
        <div className="text-center mb-4">
          <span className="text-green-300 text-sm font-bold">
            🎉 Almost Ready!
          </span>
          <p className="text-green-200 text-xs mt-1">
            Your download will start shortly
          </p>
        </div>
      ),
      "processing-wait": (
        <div className="text-center mb-4">
          <span className="text-purple-300 text-sm font-medium">
            ⏳ Processing your video...
          </span>
          <p className="text-purple-200 text-xs mt-1">
            This usually takes 10-30 seconds
          </p>
        </div>
      ),
      "pre-download": (
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-2">
            <span className="text-green-300 text-lg font-bold">
              🚀 Ready to Download!
            </span>
          </div>
          <p className="text-green-200 text-sm">
            High-quality video prepared for you
          </p>
        </div>
      ),
    };

    return headers[placement] || null;
  };

  if (!isVisible) return null;

  return (
    <div
      className={`smart-native-ad transition-all duration-500 ${getPlacementStyle()} ${className}`}
    >
      <div className={getContainerStyle()}>
        {/* Placement-specific headers */}
        {getPlacementHeader()}

        {/* Native Ad Container */}
        <div className="flex justify-center">
          <div
            id="container-2ec1a8e66e3a1bf2623b769d31d24e75"
            className="w-full max-w-sm"
          ></div>
        </div>
      </div>
    </div>
  );
}
