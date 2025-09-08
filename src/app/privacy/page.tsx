"use client";
import { useState } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Shield,
  Lock,
  Eye,
  Download,
  Server,
  Globe,
  Users,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Waves,
  Cookie,
  Database,
  UserCheck,
  Settings,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  const [lastUpdated] = useState("September 2025");

  const privacyPrinciples = [
    {
      icon: Lock,
      title: "Zero Data Collection",
      description: "We don't collect, store, or track any personal information from our users.",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "No Registration Required",
      description: "Use VidOcean completely anonymously without creating any accounts.",
      color: "text-blue-400",
    },
    {
      icon: Trash2,
      title: "Auto-Delete Downloads",
      description: "All downloaded files are automatically deleted from our servers after 1 hour.",
      color: "text-purple-400",
    },
    {
      icon: Eye,
      title: "No Tracking",
      description: "We don't use analytics, cookies, or any tracking technologies.",
      color: "text-cyan-400",
    },
    {
      icon: Database,
      title: "Minimal Server Logs",
      description: "Only basic server logs for security purposes, automatically deleted after 7 days.",
      color: "text-yellow-400",
    },
    {
      icon: Globe,
      title: "GDPR Compliant",
      description: "Fully compliant with GDPR, CCPA, and other privacy regulations worldwide.",
      color: "text-pink-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 md:px-6 overflow-x-hidden">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <div className="mb-4 sm:mb-6">
          <div className="relative mx-auto w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <Shield className="text-white animate-pulse" size={32} />
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight md:leading-[1.1]">
          Privacy Policy
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
          Your privacy is our{" "}
          <span className="text-green-400 font-bold">top priority</span>. 
          VidOcean is designed to be completely{" "}
          <span className="text-blue-400 font-bold">anonymous</span> and{" "}
          <span className="text-cyan-400 font-bold">privacy-friendly</span>. 
          We don't collect, store, or track any personal information.
        </p>

        {/* Privacy Stats */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
          <span className="bg-green-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-green-300 flex items-center space-x-1 sm:space-x-2">
            <Lock size={14} />
            <span>Zero Data Collection</span>
          </span>
          <span className="bg-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-blue-300 flex items-center space-x-1 sm:space-x-2">
            <Eye size={14} />
            <span>No Tracking</span>
          </span>
          <span className="bg-purple-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-purple-300 flex items-center space-x-1 sm:space-x-2">
            <UserCheck size={14} />
            <span>Anonymous Usage</span>
          </span>
          <span className="bg-cyan-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-cyan-300 flex items-center space-x-1 sm:space-x-2">
            <Globe size={14} />
            <span>GDPR Compliant</span>
          </span>
        </div>

        {/* Last Updated */}
        <div className="mt-6 sm:mt-8">
          <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Clock className="text-blue-400" size={16} />
            <span className="text-blue-200 text-sm">Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Privacy Principles */}
      <div className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Our Privacy Principles
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto px-4">
            VidOcean is built with privacy-by-design principles. Here's how we protect your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {privacyPrinciples.map((principle, index) => (
            <GlassCard
              key={index}
              className="p-4 sm:p-6 text-center hover:scale-100 sm:hover:scale-105 transition-transform duration-300"
            >
              <principle.icon
                className={`mx-auto mb-3 sm:mb-4 ${principle.color}`}
                size={36}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                {principle.title}
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                {principle.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Information We Don't Collect */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <div className="flex items-center space-x-3 mb-6 sm:mb-8">
          <Trash2 className="text-green-400" size={32} />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Information We DON'T Collect
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <CheckCircle className="text-green-400" size={20} />
              <span>Personal Information</span>
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• No names, email addresses, or contact information</li>
              <li>• No account creation or user profiles</li>
              <li>• No payment information (service is completely free)</li>
              <li>• No social media profiles or connections</li>
              <li>• No demographic information</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <CheckCircle className="text-green-400" size={20} />
              <span>Browsing & Usage Data</span>
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• No cookies or tracking pixels</li>
              <li>• No browsing history or behavior tracking</li>
              <li>• No device fingerprinting</li>
              <li>• No location data or IP tracking</li>
              <li>• No analytics or usage statistics</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-green-500/10 rounded-lg border border-green-400/30">
          <div className="flex items-start space-x-3">
            <Heart className="text-green-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-green-300 font-bold mb-2">Privacy Promise</h4>
              <p className="text-green-200 text-sm sm:text-base">
                We have designed VidOcean to be completely anonymous. You can use our service 
                without any concerns about your privacy or personal data being collected.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* How VidOcean Works (Privacy Perspective) */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          How VidOcean Protects Your Privacy
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
              1
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Anonymous Access</h4>
            <p className="text-blue-200 text-sm sm:text-base">
              No registration, no accounts, no personal information required. 
              Just paste your URL and download anonymously.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
              2
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Temporary Processing</h4>
            <p className="text-blue-200 text-sm sm:text-base">
              Your downloads are processed temporarily on our servers and 
              automatically deleted within 1 hour. No permanent storage.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl">
              3
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Secure Connection</h4>
            <p className="text-blue-200 text-sm sm:text-base">
              All connections are encrypted with HTTPS. Your downloads are 
              secure and private between you and our servers.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Third-Party Services */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Server className="text-blue-400" />
          <span>Third-Party Services</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
              Video Processing Backend
            </h3>
            <p className="text-blue-200 text-sm sm:text-base mb-3">
              VidOcean uses yt-dlp and FFmpeg for video processing. These are open-source tools 
              that run on our servers and don't collect any personal information.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
              Hosting Infrastructure
            </h3>
            <p className="text-blue-200 text-sm sm:text-base mb-3">
              Our website is hosted on secure servers with industry-standard security measures. 
              Server access logs are kept minimal and automatically deleted after 7 days.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
              Source Platform Access
            </h3>
            <p className="text-blue-200 text-sm sm:text-base mb-3">
              When you download content, our servers access the source platform (YouTube, Instagram, etc.) 
              on your behalf. We don't share your information with these platforms.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
          <div className="flex items-start space-x-3">
            <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-blue-300 font-bold mb-2">Important Note</h4>
              <p className="text-blue-200 text-sm sm:text-base">
                We don't use any third-party analytics, advertising networks, or tracking services. 
                Your privacy is maintained throughout the entire process.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Data Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-2">
            <Lock className="text-green-400" />
            <span>Data Security</span>
          </h2>
          
          <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>HTTPS encryption for all connections</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>Secure server infrastructure</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>Automatic file deletion after 1 hour</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>No data backup or archival</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>Regular security updates</span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-2">
            <Globe className="text-blue-400" />
            <span>Legal Compliance</span>
          </h2>
          
          <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-blue-400 mt-1 flex-shrink-0" size={14} />
              <span>GDPR (General Data Protection Regulation)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-blue-400 mt-1 flex-shrink-0" size={14} />
              <span>CCPA (California Consumer Privacy Act)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-blue-400 mt-1 flex-shrink-0" size={14} />
              <span>PIPEDA (Personal Information Protection)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-blue-400 mt-1 flex-shrink-0" size={14} />
              <span>Privacy-by-design principles</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="text-blue-400 mt-1 flex-shrink-0" size={14} />
              <span>International privacy standards</span>
            </li>
          </ul>
        </GlassCard>
      </div>

      {/* Cookies and Tracking */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Cookie className="text-yellow-400" />
          <span>Cookies and Tracking</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3 text-red-300">❌ What We DON'T Use</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• No tracking cookies</li>
              <li>• No analytics cookies</li>
              <li>• No advertising cookies</li>
              <li>• No third-party cookies</li>
              <li>• No Google Analytics</li>
              <li>• No Facebook Pixel</li>
              <li>• No session tracking</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3 text-green-300">✅ What We Use</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Essential technical cookies only (if any)</li>
              <li>• Local browser storage for user preferences</li>
              <li>• No persistent tracking</li>
              <li>• All data stays on your device</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
          <div className="flex items-start space-x-3">
            <Cookie className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-yellow-300 font-bold mb-2">Cookie-Free Experience</h4>
              <p className="text-yellow-200 text-sm sm:text-base">
                VidOcean works completely without cookies. Your browser preferences and 
                download history are not stored or tracked by our servers.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Children's Privacy */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Users className="text-pink-400" />
          <span>Children's Privacy</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-4 leading-relaxed">
          VidOcean is designed to be safe for users of all ages. Since we don't collect any personal 
          information, there are no special privacy concerns for children under 13.
        </p>
        
        <p className="text-blue-200 text-sm sm:text-base mb-6 leading-relaxed">
          However, we recommend that parents supervise their children's internet usage and ensure 
          they only download content that is appropriate and legally available.
        </p>

        <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-400/30">
          <div className="flex items-start space-x-3">
            <Users className="text-pink-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-pink-300 font-bold mb-2">COPPA Compliance</h4>
              <p className="text-pink-200 text-sm sm:text-base">
                VidOcean complies with the Children's Online Privacy Protection Act (COPPA) 
                by not collecting any personal information from users of any age.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Your Rights */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <UserCheck className="text-cyan-400" />
          <span>Your Privacy Rights</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-6 leading-relaxed">
          Since VidOcean doesn't collect any personal data, most traditional privacy rights 
          don't apply. However, here's what you should know:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">✅ Rights You Already Have</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Complete anonymity</li>
              <li>• No data to access or download</li>
              <li>• No data to delete or correct</li>
              <li>• No marketing or communications</li>
              <li>• No data sharing with third parties</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-4">📧 Contact Us</h3>
            <p className="text-blue-200 text-sm sm:text-base mb-3">
              If you have any privacy concerns or questions:
            </p>
            <Link 
              href="/about" 
              className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Mail size={16} />
              <span>Contact Developer</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Policy Updates */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <RefreshCw className="text-blue-400" />
          <span>Policy Updates</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-4 leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes in our 
          practices or legal requirements. When we make changes:
        </p>

        <ul className="space-y-2 text-blue-200 text-sm sm:text-base mb-6">
          <li>• We will update the "Last Updated" date at the top of this page</li>
          <li>• Significant changes will be highlighted on our website</li>
          <li>• We will never reduce privacy protections without notice</li>
          <li>• Continued use implies acceptance of updates</li>
        </ul>

        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
          <div className="flex items-start space-x-3">
            <RefreshCw className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-blue-300 font-bold mb-2">Stay Informed</h4>
              <p className="text-blue-200 text-sm sm:text-base">
                We recommend checking this page periodically for any updates. 
                Our commitment to your privacy will always remain our top priority.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Final CTA */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-6 sm:p-8 md:p-12">
          <div className="mb-6">
            <Shield className="mx-auto text-green-400 animate-pulse" size={48} />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Your Privacy is Protected
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Use VidOcean with complete confidence. No registration, no tracking, 
            no data collection. Just fast, free, and private video downloads.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
            >
              <Download size={20} />
              <span>Start Downloading Safely</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border border-white/20 text-white font-bold text-base sm:text-lg rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <Mail size={20} />
              <span>Contact Us</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
