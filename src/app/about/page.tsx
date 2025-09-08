"use client";
import { useState } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Download,
  Instagram,
  Facebook,
  Youtube,
  Music,
  Sparkles,
  CheckCircle,
  Star,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  Video,
  Heart,
  Share2,
  Clock,
  Shield,
  Zap,
  Award,
  Mail,
  Phone,
  ExternalLink,
  User,
  Waves,
  Copy,
  MessageCircle,
  Send,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const supportedPlatforms = [
    {
      name: "YouTube",
      icon: Youtube,
      color: "text-red-500",
      desc: "Videos, Shorts, Audio",
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-500",
      desc: "Reels, Posts, Stories, IGTV",
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-500",
      desc: "Videos, Reels, Posts, Stories",
    },
    {
      name: "TikTok",
      icon: Music,
      color: "text-pink-400",
      desc: "Videos without watermark",
    },
    {
      name: "Twitter/X",
      icon: Share2,
      color: "text-blue-400",
      desc: "Videos, GIFs",
    },
    {
      name: "Reddit",
      icon: Globe,
      color: "text-orange-500",
      desc: "Videos, GIFs",
    },
    { name: "Vimeo", icon: Video, color: "text-blue-300", desc: "HD Videos" },
    {
      name: "Dailymotion",
      icon: Video,
      color: "text-orange-400",
      desc: "Videos",
    },
    {
      name: "Twitch",
      icon: Zap,
      color: "text-purple-500",
      desc: "Clips, VODs",
    },
    {
      name: "LinkedIn",
      icon: Users,
      color: "text-blue-600",
      desc: "Videos, Posts",
    },
    {
      name: "Pinterest",
      icon: Heart,
      color: "text-red-400",
      desc: "Videos, Images",
    },
    {
      name: "Snapchat",
      icon: MessageCircle,
      color: "text-yellow-400",
      desc: "Public Stories",
    },
  ];
  const features = [
    {
      icon: Download,
      title: "Universal Downloads",
      description:
        "Download from 1000+ platforms with guaranteed audio quality and multiple format options.",
      color: "text-cyan-400",
    },
    {
      icon: Clock,
      title: "Real-Time Progress",
      description:
        "Watch your downloads progress in real-time with speed, ETA, and completion percentage.",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "100% Safe & Secure",
      description:
        "No malware, no ads, no privacy concerns. Completely safe downloads every time.",
      color: "text-blue-400",
    },
    {
      icon: Sparkles,
      title: "No Watermarks",
      description:
        "Download TikTok and other platform videos without watermarks in original quality.",
      color: "text-purple-400",
    },
    {
      icon: Award,
      title: "Professional Quality",
      description:
        "Choose from multiple quality options from 360p to 4K with perfect audio synchronization.",
      color: "text-yellow-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Quick processing and fast downloads with optimized servers for best performance.",
      color: "text-pink-400",
    },
  ];
  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 md:px-6 overflow-x-hidden">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <div className="mb-4 sm:mb-6">
          <div className="relative mx-auto w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <Waves className="text-white animate-pulse" size={32} />
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent leading-tight md:leading-[1.1]">
          About VidOcean
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
          The ultimate{" "}
          <span className="text-cyan-400 font-bold">
            universal video downloader
          </span>{" "}
          supporting
          <span className="text-blue-400 font-bold"> 1000+ platforms</span> with
          <span className="text-green-400 font-bold">
            {" "}
            guaranteed audio quality
          </span>{" "}
          and
          <span className="text-purple-400 font-bold">
            {" "}
            real-time progress tracking
          </span>
          . Free, safe, and professional-grade video downloading for everyone.
        </p>
        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm">
          <span className="bg-cyan-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-cyan-300 flex items-center space-x-1 sm:space-x-2">
            <Globe size={14} />
            <span>1000+ Platforms</span>
          </span>
          <span className="bg-green-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-green-300 flex items-center space-x-1 sm:space-x-2">
            <Shield size={14} />
            <span>100% Safe</span>
          </span>
          <span className="bg-purple-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-purple-300 flex items-center space-x-1 sm:space-x-2">
            <Zap size={14} />
            <span>Lightning Fast</span>
          </span>
          <span className="bg-pink-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-pink-300 flex items-center space-x-1 sm:space-x-2">
            <Award size={14} />
            <span>Professional Quality</span>
          </span>
        </div>
      </div>
      {/* What We Do Section */}
      <div className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            What VidOcean Can Do
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto px-4">
            VidOcean is a comprehensive, free online video downloader that
            supports thousands of platforms with professional-grade features and
            guaranteed quality.
          </p>
        </div>
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12 md:mb-16">
          {features.map((feature, index) => (
            <GlassCard
              key={index}
              className="p-4 sm:p-6 text-center hover:scale-100 sm:hover:scale-105 transition-transform duration-300"
            >
              <feature.icon
                className={`mx-auto mb-3 sm:mb-4 ${feature.color}`}
                size={36}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
      {/* Supported Platforms Section */}
      <div className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Supported Social Media Platforms
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-4xl mx-auto px-4">
            Download videos, audio, and content from all major social media
            platforms and video hosting sites. We support over 1000 platforms
            with more being added regularly.
          </p>
        </div>
        {/* Main Platforms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {supportedPlatforms.slice(0, 4).map((platform, index) => (
            <GlassCard
              key={index}
              className="p-4 sm:p-6 text-center border-l-0 sm:border-l-4 border-l-cyan-400 hover:scale-100 sm:hover:scale-105 transition-transform duration-300"
            >
              <platform.icon
                className={`mx-auto mb-3 sm:mb-4 ${platform.color}`}
                size={36}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {platform.name}
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm">
                {platform.desc}
              </p>
              {platform.name === "YouTube" && (
                <div className="mt-2 sm:mt-3">
                  <span className="text-[10px] sm:text-xs bg-red-500/20 px-2 py-1 rounded-full text-red-300">
                    Most Popular
                  </span>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
        {/* Additional Platforms */}
        <GlassCard className="p-4 sm:p-6 md:p-8">
  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
    Additional Supported Platforms
  </h3>
  
  {/* ✅ Small devices के लिए centered grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 justify-items-center sm:justify-items-start">
    {supportedPlatforms.slice(4).map((platform, index) => (
      <div
        key={index}
        className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-white/5 transition-all w-full max-w-xs sm:max-w-none"
      >
        <platform.icon
          className={`${platform.color} flex-shrink-0`}
          size={20}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm sm:text-base">
            {platform.name}
          </h4>
          <p className="text-blue-200 text-[10px] sm:text-xs truncate">
            {platform.desc}
          </p>
        </div>
      </div>
    ))}
  </div>
  
  <div className="mt-6 sm:mt-8 text-center">
    <p className="text-blue-300 font-medium mb-2 text-sm sm:text-base">
      And 988+ More Platforms!
    </p>
    <p className="text-blue-200 text-xs sm:text-sm px-2">
      Including Bitchute, 9GAG, SoundCloud, Spotify, WhatsApp Status,
      Telegram, Discord, WeChat, and hundreds of other video hosting and
      social media platforms.
    </p>
  </div>
</GlassCard>

      </div>
      {/* How It Works Section */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          How VidOcean Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
              1
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              Paste URL
            </h4>
            <p className="text-blue-200 text-sm sm:text-base">
              Copy and paste the video URL from any supported platform. Works
              with direct links, shortened URLs, and shared links from mobile
              apps.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
              2
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              Choose Quality
            </h4>
            <p className="text-blue-200 text-sm sm:text-base">
              Select your preferred quality and format from available options.
              View file sizes, resolution, and choose video+audio or audio-only
              downloads.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
              3
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
              Download
            </h4>
            <p className="text-blue-200 text-sm sm:text-base">
              Click download and watch real-time progress. Files are processed
              on our servers and delivered directly to your device with
              guaranteed quality.
            </p>
          </div>
        </div>
      </GlassCard>
      {/* Why Choose Us Section */}
      <div className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            Why Choose VidOcean?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <GlassCard className="p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">
              ✅ What We Offer
            </h3>
            <ul className="space-y-3 sm:space-y-4 text-blue-200">
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Completely free with no hidden costs or premium tiers
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  No registration or account creation required
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Guaranteed audio quality with video+audio merging
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Real-time progress tracking with speed and ETA
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Multiple quality options from 360p to 4K
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  No watermarks on downloaded content
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Works on all devices: desktop, mobile, tablet
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <CheckCircle
                  className="text-green-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Advanced error handling and troubleshooting guidance
                </span>
              </li>
            </ul>
          </GlassCard>
          <GlassCard className="p-4 sm:p-6 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">
              🚀 Our Technology
            </h3>
            <ul className="space-y-3 sm:space-y-4 text-blue-200">
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Built with Next.js 13+ for maximum performance
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Server-Side Events (SSE) for real-time progress
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  FFmpeg integration for professional audio/video merging
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  yt-dlp backend for maximum platform compatibility
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Responsive design with ocean-themed glassmorphism UI
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  SEO optimized for better discoverability
                </span>
              </li>
              <li className="flex items-start space-x-2 sm:space-x-3">
                <Star
                  className="text-yellow-400 mt-1 flex-shrink-0"
                  size={14}
                />
                <span className="text-xs sm:text-sm md:text-base">
                  Regular updates and new platform support
                </span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
      {/* Developer Information */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <User className="text-white" size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
            Meet the Developer
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-200 max-w-2xl mx-auto px-2">
            VidOcean is developed and maintained by{" "}
            <span className="text-cyan-400 font-bold">Ankit Pratap</span>, a
            passionate full-stack developer dedicated to creating amazing user
            experiences.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Developer Info */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">
              👨‍💻 About Ankit Pratap
            </h3>
            <div className="space-y-3 sm:space-y-4 text-blue-200">
              <p className="text-sm sm:text-base leading-relaxed">
                Full-stack developer specializing in React, Next.js, and modern
                web technologies. Passionate about creating user-friendly
                applications that solve real-world problems.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                VidOcean represents hundreds of hours of development, testing,
                and optimization to create the most reliable and feature-rich
                video downloader available online.
              </p>
              <p className="text-sm sm:text-base leading-relaxed">
                Committed to keeping the service completely free, ad-free, and
                constantly improving based on user feedback and new platform
                requirements.
              </p>
            </div>
          </div>
          {/* Contact Information */}
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">
              📞 Get in Touch
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <Mail className="text-cyan-400 flex-shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base">
                      Email
                    </p>
                    <p className="text-blue-200 text-xs sm:text-sm truncate">
                      pratapguptaankit@gmail.com
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy("pratapguptaankit@gmail.com", "email")
                  }
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0 ml-2"
                >
                  {copied === "email" ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span className="text-xs sm:text-sm">
                    {copied === "email" ? "Copied!" : "Copy"}
                  </span>
                </button>
              </div>
              {/* Telegram */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <Send className="text-blue-400 flex-shrink-0" size={18} />
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base">
                      Telegram
                    </p>
                    <p className="text-blue-200 text-xs sm:text-sm truncate">
                      Join our channel
                    </p>
                  </div>
                </div>
                <a
                  href="https://t.me/+HM3SoEG1Xk00MWZl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 ml-2"
                >
                  <ExternalLink size={14} />
                  <span className="text-xs sm:text-sm">Join</span>
                </a>
              </div>

              {/* QR Code Section - Space for image */}
              <div className="p-4 sm:p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="text-center">
                  <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">
                    📱 Scan QR Code to Join Telegram
                  </h4>

                  {/* ✅ QR Code को center करने का सही तरीका */}
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <Image
                      src="/image.png"
                      alt="Telegram QR Code"
                      width={160}
                      height={160}
                      className="rounded-lg"
                    />
                  </div>

                  <p className="text-blue-200 text-xs sm:text-sm mt-2 sm:mt-3">
                    Scan with your phone camera to join our Telegram channel
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-white font-bold text-sm sm:text-base">
                  Follow on Social Media:
                </h4>
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/ankit.pratap.52090"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg border border-blue-400/30 hover:bg-blue-500/30 transition-all"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <Facebook
                      className="text-blue-400 flex-shrink-0"
                      size={18}
                    />
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base">
                        Facebook
                      </p>
                      <p className="text-blue-200 text-xs sm:text-sm truncate">
                        ankit.pratap.52090
                      </p>
                    </div>
                  </div>
                  <ExternalLink
                    className="text-blue-400 flex-shrink-0"
                    size={14}
                  />
                </a>
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/mrankitpratap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-pink-500/20 rounded-lg border border-pink-400/30 hover:bg-pink-500/30 transition-all"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <Instagram
                      className="text-pink-400 flex-shrink-0"
                      size={18}
                    />
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base">
                        Instagram
                      </p>
                      <p className="text-blue-200 text-xs sm:text-sm truncate">
                        @mrankitpratap
                      </p>
                    </div>
                  </div>
                  <ExternalLink
                    className="text-pink-400 flex-shrink-0"
                    size={14}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
      {/* FAQ Section */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
              Is VidOcean completely free?
            </h4>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              Yes! VidOcean is 100% free with no hidden costs, premium tiers, or
              subscription plans. We believe everyone should have access to
              high-quality video downloading tools.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
              How many platforms do you support?
            </h4>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              We support over 1000 platforms including all major social media
              sites (YouTube, Instagram, TikTok, Facebook), video hosting
              platforms, and many specialized sites. New platforms are added
              regularly.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
              Is it safe to use VidOcean?
            </h4>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              Absolutely! We don't store your downloads, collect personal data,
              or install any software. Everything is processed securely on our
              servers with no malware, ads, or privacy concerns.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
              What quality options are available?
            </h4>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              We provide all available quality options from each platform,
              typically ranging from 360p to 4K resolution. You can also choose
              audio-only downloads and different file formats based on your
              needs.
            </p>
          </div>
          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">
              Can I download private content?
            </h4>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              No, we only support public content for privacy and legal reasons.
              Private accounts, restricted content, or copyrighted material with
              download restrictions cannot be processed.
            </p>
          </div>
        </div>
      </GlassCard>
      {/* Final CTA */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Downloading?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join thousands of users who trust VidOcean for their video
            downloading needs. Fast, free, and reliable downloads from 1000+
            platforms.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
            >
              <Download size={20} />
              <span>Start Downloading Now</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
