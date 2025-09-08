"use client";
import { useState } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  BookOpen,
  Play,
  Download,
  Youtube,
  Instagram,
  Facebook,
  Music,
  Copy,
  CheckCircle,
  AlertTriangle,
  Info,
  Smartphone,
  Monitor,
  Headphones,
  Video,
  Star,
  Zap,
  Clock,
  Settings,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Shield,
  Globe,
  Users,
  Heart,
  Share2,
  Eye,
  FileDown,
  Waves,
  ChevronDown,
  ChevronUp,
  Search,
  Link as LinkIcon,
  Clipboard,
  RefreshCw,
  Wifi,
  HardDrive,
  Timer,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const platforms = [
    {
      name: "YouTube",
      icon: Youtube,
      color: "text-red-400",
      bg: "bg-red-500/20",
      border: "border-red-400/30",
      description: "Videos, Shorts, Audio",
      guide: [
        "Go to YouTube and find the video you want to download",
        "Copy the URL from the address bar or share button",
        "Paste the URL into VidOcean",
        "Choose your preferred quality and format",
        "Click download and wait for completion",
      ],
      tips: [
        "Works with both youtube.com and youtu.be URLs",
        "Shorts are automatically detected and optimized",
        "Audio-only downloads available for music",
        "4K quality available for supported videos",
      ],
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-400",
      bg: "bg-pink-500/20",
      border: "border-pink-400/30",
      description: "Reels, Posts, Stories, IGTV",
      guide: [
        "Open Instagram and navigate to the content",
        "Tap the share button (paper plane icon)",
        "Select 'Copy Link' or copy from browser",
        "Paste the URL into VidOcean",
        "Select quality and download",
      ],
      tips: [
        "Works with Reels, Posts, Stories, and IGTV",
        "Stories expire after 24 hours",
        "Multiple photos in posts are supported",
        "Original quality preserved",
      ],
    },
    {
      name: "TikTok",
      icon: Music,
      color: "text-pink-500",
      bg: "bg-pink-600/20",
      border: "border-pink-500/30",
      description: "Videos without watermark",
      guide: [
        "Open TikTok and find the video",
        "Tap the share arrow on the right",
        "Select 'Copy Link'",
        "Paste into VidOcean",
        "Download without watermark!",
      ],
      tips: [
        "Automatic watermark removal",
        "Original audio preserved",
        "Works with both app and web links",
        "Trending videos supported",
      ],
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-500",
      bg: "bg-blue-500/20",
      border: "border-blue-400/30",
      description: "Videos, Reels, Stories",
      guide: [
        "Navigate to the Facebook video or reel",
        "Click the share button below the video",
        "Copy the link to the video",
        "Paste URL into VidOcean",
        "Choose format and download",
      ],
      tips: [
        "Works with public content only",
        "Facebook Reels supported",
        "Stories available for 24 hours",
        "Group content must be public",
      ],
    },
  ];

  const quickSteps = [
    {
      icon: LinkIcon,
      title: "Copy URL",
      description: "Copy the video link from any supported platform",
    },
    {
      icon: Clipboard,
      title: "Paste & Analyze",
      description: "Paste the URL and let VidOcean analyze the content",
    },
    {
      icon: Settings,
      title: "Choose Quality",
      description: "Select your preferred quality and format options",
    },
    {
      icon: Download,
      title: "Download",
      description: "Click download and watch real-time progress",
    },
  ];

  const qualityGuide = [
    {
      quality: "4K (2160p)",
      icon: Monitor,
      description: "Ultra HD quality, largest file size",
      bestFor: "Large screens, professional use",
      color: "text-purple-400",
    },
    {
      quality: "1080p (Full HD)",
      icon: Video,
      description: "High definition, balanced size",
      bestFor: "Most common choice, good for all devices",
      color: "text-blue-400",
    },
    {
      quality: "720p (HD)",
      icon: Smartphone,
      description: "Good quality, moderate size",
      bestFor: "Mobile devices, faster downloads",
      color: "text-green-400",
    },
    {
      quality: "480p (SD)",
      icon: Wifi,
      description: "Standard definition, small size",
      bestFor: "Slow internet, storage saving",
      color: "text-yellow-400",
    },
    {
      quality: "Audio Only",
      icon: Headphones,
      description: "Extract audio only, smallest size",
      bestFor: "Music, podcasts, audio content",
      color: "text-pink-400",
    },
  ];

  const troubleshooting = [
    {
      problem: "Video not found or private",
      solution:
        "Ensure the video is public and the URL is correct. Private content cannot be downloaded.",
      icon: Eye,
    },
    {
      problem: "Download is slow or stuck",
      solution:
        "Check your internet connection. Large files take longer. Try a lower quality if needed.",
      icon: Wifi,
    },
    {
      problem: "Audio and video out of sync",
      solution:
        "This is rare with VidOcean. Try re-downloading or contact support if it persists.",
      icon: Activity,
    },
    {
      problem: "Format not supported",
      solution:
        "Try different quality options. Some platforms may have limited format availability.",
      icon: FileDown,
    },
    {
      problem: "URL not recognized",
      solution:
        "Make sure you're using the direct video URL, not a search result or playlist link.",
      icon: LinkIcon,
    },
    {
      problem: "Download interrupted",
      solution:
        "Refresh the page and try again. Check your internet connection stability.",
      icon: RefreshCw,
    },
  ];

  const faqs = [
    {
      question: "Which platforms does VidOcean support?",
      answer:
        "VidOcean supports 1000+ platforms including YouTube, Instagram, TikTok, Facebook, Twitter, Reddit, Vimeo, Dailymotion, and many more.",
    },
    {
      question: "Is VidOcean completely free?",
      answer:
        "Yes! VidOcean is 100% free with no hidden costs, subscriptions, or premium features. All functionality is available to everyone.",
    },
    {
      question: "What quality options are available?",
      answer:
        "Quality options depend on the source video, typically ranging from 360p to 4K. You can also download audio-only versions.",
    },
    {
      question: "Can I download private videos?",
      answer:
        "No, VidOcean only works with public content for privacy and legal reasons. The video must be publicly accessible.",
    },
    {
      question: "How long are files stored on your servers?",
      answer:
        "Downloaded files are automatically deleted from our servers after 1 hour. We don't store any content permanently.",
    },
    {
      question: "Can I use VidOcean on mobile devices?",
      answer:
        "Absolutely! VidOcean is fully responsive and works great on smartphones, tablets, and desktop computers.",
    },
    {
      question: "Why is my download taking so long?",
      answer:
        "Download speed depends on file size, your internet connection, and server load. Larger/higher quality files take longer.",
    },
    {
      question: "Is it legal to download videos?",
      answer:
        "You're responsible for ensuring you have the right to download content. Only download content you have permission to use.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 md:px-6 overflow-x-hidden">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <div className="mb-4 sm:mb-6">
          <div className="relative mx-auto w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <BookOpen className="text-white animate-pulse" size={32} />
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight md:leading-[1.1]">
          Complete VidOcean Guide
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
          Learn how to{" "}
          <span className="text-cyan-400 font-bold">download videos</span> from{" "}
          <span className="text-purple-400 font-bold">1000+ platforms</span>{" "}
          with{" "}
          <span className="text-blue-400 font-bold">step-by-step guides</span>,{" "}
          <span className="text-green-400 font-bold">expert tips</span>, and{" "}
          <span className="text-pink-400 font-bold">troubleshooting help</span>.
        </p>

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
          <a
            href="#quick-start"
            className="bg-cyan-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-cyan-300 flex items-center space-x-1 sm:space-x-2 hover:bg-cyan-500/30 transition-colors"
          >
            <Zap size={14} />
            <span>Quick Start</span>
          </a>
          <a
            href="#platforms"
            className="bg-purple-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-purple-300 flex items-center space-x-1 sm:space-x-2 hover:bg-purple-500/30 transition-colors"
          >
            <Globe size={14} />
            <span>Platforms</span>
          </a>
          <a
            href="#quality"
            className="bg-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-blue-300 flex items-center space-x-1 sm:space-x-2 hover:bg-blue-500/30 transition-colors"
          >
            <Settings size={14} />
            <span>Quality Guide</span>
          </a>
          <a
            href="#troubleshooting"
            className="bg-red-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-red-300 flex items-center space-x-1 sm:space-x-2 hover:bg-red-500/30 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </a>
        </div>
      </div>

      {/* Quick Start Guide */}
      <section id="quick-start" className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Quick Start Guide
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto px-4">
            Get started with VidOcean in just 4 simple steps. Download videos
            from any platform in minutes!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickSteps.map((step, index) => (
            <GlassCard
              key={index}
              className="p-4 sm:p-6 text-center hover:scale-100 sm:hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => setActiveStep(activeStep === index ? null : index)}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
                {index + 1}
              </div>
              <step.icon
                className="mx-auto mb-3 sm:mb-4 text-cyan-400"
                size={32}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                {step.title}
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                {step.description}
              </p>
              {activeStep === index && (
                <div className="mt-4 pt-4 border-t border-cyan-400/30">
                  <div className="text-left">
                    <h4 className="text-cyan-300 font-bold mb-2 text-sm">
                      Detailed Steps:
                    </h4>
                    <ul className="text-blue-200 text-xs space-y-1">
                      {index === 0 && (
                        <>
                          <li>• Navigate to your desired video platform</li>
                          <li>• Find the video you want to download</li>
                          <li>
                            • Click share or copy the URL from address bar
                          </li>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <li>• Open VidOcean in your browser</li>
                          <li>• Paste the URL in the input field</li>
                          <li>• Wait for automatic content analysis</li>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <li>• Review available quality options</li>
                          <li>• Select video+audio or audio-only</li>
                          <li>• Check file size and format</li>
                        </>
                      )}
                      {index === 3 && (
                        <>
                          <li>• Click the download button</li>
                          <li>• Monitor real-time progress</li>
                          <li>• File automatically saves to device</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
          >
            <Play size={20} />
            <span>Try VidOcean Now</span>
          </Link>
        </div>
      </section>

      {/* Platform-Specific Guides */}
      <section id="platforms" className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Platform-Specific Guides
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto px-4">
            Detailed step-by-step guides for each major platform with specific
            tips and tricks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {platforms.map((platform, index) => (
            <GlassCard
              key={index}
              className={`p-4 sm:p-6 border-l-0 sm:border-l-4 ${platform.border} hover:scale-100 sm:hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className={`p-2 sm:p-3 ${platform.bg} rounded-lg`}>
                  <platform.icon className={platform.color} size={24} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {platform.name}
                  </h3>
                  <p className="text-blue-200 text-xs sm:text-sm">
                    {platform.description}
                  </p>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h4 className="text-white font-bold mb-3 text-sm sm:text-base">
                  Step-by-Step Guide:
                </h4>
                <ol className="space-y-2">
                  {platform.guide.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start space-x-2">
                      <span
                        className={`${platform.color} font-bold flex-shrink-0 text-xs sm:text-sm`}
                      >
                        {stepIndex + 1}.
                      </span>
                      <span className="text-blue-200 text-xs sm:text-sm">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-white font-bold mb-3 text-sm sm:text-base">
                  💡 Pro Tips:
                </h4>
                <ul className="space-y-1">
                  {platform.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-2">
                      <Star
                        className={`${platform.color} flex-shrink-0 mt-0.5`}
                        size={12}
                      />
                      <span className="text-blue-200 text-xs sm:text-sm">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 sm:mt-6">
                <Link
                  href={`/${platform.name.toLowerCase()}`}
                  className={`inline-flex items-center space-x-2 px-4 py-2 ${platform.bg} border ${platform.border} text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-opacity-30 transition-all`}
                >
                  <span>Try {platform.name} Downloads</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Quality Selection Guide */}
      <section id="quality" className="mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            Quality Selection Guide
          </h2>

          <p className="text-blue-200 text-sm sm:text-base mb-6 sm:mb-8 text-center max-w-3xl mx-auto">
            Choose the right quality for your needs. Higher quality means better
            resolution but larger file sizes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {qualityGuide.map((item, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <item.icon className={item.color} size={24} />
                  <h3 className="text-white font-bold text-sm sm:text-base">
                    {item.quality}
                  </h3>
                </div>
                <p className="text-blue-200 text-xs sm:text-sm mb-2">
                  {item.description}
                </p>
                <p className={`${item.color} text-xs font-medium`}>
                  Best for: {item.bestFor}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
            <div className="flex items-start space-x-3">
              <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="text-blue-300 font-bold mb-2">Quality Tips</h4>
                <ul className="text-blue-200 text-xs sm:text-sm space-y-1">
                  <li>
                    • Higher quality = larger file size and longer download time
                  </li>
                  <li>
                    • Choose 1080p for the best balance of quality and size
                  </li>
                  <li>• Use audio-only for music, podcasts, or speeches</li>
                  <li>
                    • 4K is only available if the original video supports it
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Progress Tracking Guide */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          Understanding Download Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Progress Indicators
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                <Activity className="text-green-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Download Speed
                  </p>
                  <p className="text-green-200 text-xs sm:text-sm">
                    Shows current download speed (MB/s)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg">
                <Timer className="text-blue-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Time Remaining
                  </p>
                  <p className="text-blue-200 text-xs sm:text-sm">
                    Estimated time to completion (ETA)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
                <HardDrive className="text-purple-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    File Size Progress
                  </p>
                  <p className="text-purple-200 text-xs sm:text-sm">
                    Downloaded amount vs total size
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Download States
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="text-yellow-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Starting
                  </p>
                  <p className="text-yellow-200 text-xs sm:text-sm">
                    Initializing download process
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg">
                <Download className="text-blue-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Downloading
                  </p>
                  <p className="text-blue-200 text-xs sm:text-sm">
                    Actively downloading content
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-orange-500/10 rounded-lg">
                <Settings className="text-orange-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Processing
                  </p>
                  <p className="text-orange-200 text-xs sm:text-sm">
                    Merging audio and video
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="text-green-400" size={20} />
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">
                    Completed
                  </p>
                  <p className="text-green-200 text-xs sm:text-sm">
                    Download finished successfully
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Troubleshooting Section */}
      <section id="troubleshooting" className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Troubleshooting Guide
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto px-4">
            Common issues and their solutions. Most problems can be solved
            quickly with these tips.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {troubleshooting.map((item, index) => (
            <GlassCard key={index} className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                  <item.icon className="text-red-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold mb-2 text-sm sm:text-base">
                    {item.problem}
                  </h3>
                  <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="mt-8">
          <GlassCard className="p-4 sm:p-6 md:p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 text-yellow-400" size={48} />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Still Having Issues?
            </h3>
            <p className="text-blue-200 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
              If your problem isn't listed above or the solutions don't work,
              our developer is here to help! Get personalized support for any
              VidOcean issues.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
            >
              <HelpCircle size={20} />
              <span>Contact Support</span>
              <ExternalLink size={16} />
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* FAQ Section */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedFaq(expandedFaq === index ? null : index)
                }
                className="w-full p-4 sm:p-5 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
              >
                <h3 className="text-white font-bold text-sm sm:text-base pr-4">
                  {faq.question}
                </h3>
                {expandedFaq === index ? (
                  <ChevronUp
                    className="text-blue-400 flex-shrink-0"
                    size={20}
                  />
                ) : (
                  <ChevronDown
                    className="text-blue-400 flex-shrink-0"
                    size={20}
                  />
                )}
              </button>

              {expandedFaq === index && (
                <div className="p-4 sm:p-5 pt-0 border-t border-white/10">
                  <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Mobile vs Desktop Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-4 sm:p-6 md:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <Smartphone
              className="mx-auto mb-3 sm:mb-4 text-green-400"
              size={48}
            />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Mobile Usage Tips
            </h2>
          </div>

          <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-green-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Use the share button in apps to copy links quickly</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-green-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>
                Downloads save directly to your device's downloads folder
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-green-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Lower qualities download faster on mobile data</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-green-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>VidOcean works in all mobile browsers</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-green-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Portrait videos (like TikTok) stay in vertical format</span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 md:p-8">
          <div className="text-center mb-4 sm:mb-6">
            <Monitor className="mx-auto mb-3 sm:mb-4 text-blue-400" size={48} />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Desktop Usage Tips
            </h2>
          </div>

          <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-blue-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Faster processing and download speeds</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-blue-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Better for downloading large 4K files</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-blue-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Detailed progress information displayed</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-blue-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Easy to organize and manage downloaded files</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle
                className="text-blue-400 mt-1 flex-shrink-0"
                size={14}
              />
              <span>Copy-paste URLs more convenient with keyboard</span>
            </li>
          </ul>
        </GlassCard>
      </div>

      {/* Final CTA */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-6 sm:p-8 md:p-12">
          <div className="mb-6">
            <Waves className="mx-auto text-cyan-400 animate-pulse" size={48} />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Downloading?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            You're now ready to use VidOcean like a pro! Download videos from
            1000+ platforms with confidence using our comprehensive guide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
            >
              <Download size={20} />
              <span>Start Downloading Now</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border border-white/20 text-white font-bold text-base sm:text-lg rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <HelpCircle size={20} />
              <span>Need More Help?</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
