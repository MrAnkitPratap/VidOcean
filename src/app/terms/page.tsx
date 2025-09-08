"use client";
import { useState } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  FileText,
  Scale,
  Users,
  Download,
  Shield,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Waves,
  Copyright,
  Server,
  Lock,
  Eye,
  Ban,
  RefreshCw,
  Mail,
  ExternalLink,
  Info,
  Award,
  Zap,
  Heart,
  UserCheck,
  Settings,
  Smartphone,
  Monitor,
  Headphones,
} from "lucide-react";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  const [lastUpdated] = useState("September 2025");

  const keyTerms = [
    {
      icon: Download,
      title: "Free Service",
      description: "VidOcean is completely free with no hidden costs, subscriptions, or premium tiers.",
      color: "text-green-400",
    },
    {
      icon: Globe,
      title: "Public Content Only",
      description: "Only download public content that you have the right to access and download.",
      color: "text-blue-400",
    },
    {
      icon: Shield,
      title: "Personal Use",
      description: "Downloaded content is for personal, non-commercial use only unless otherwise permitted.",
      color: "text-purple-400",
    },
    {
      icon: Ban,
      title: "No Abuse",
      description: "Don't abuse our service with excessive requests or automated tools.",
      color: "text-red-400",
    },
    {
      icon: Copyright,
      title: "Respect Copyright",
      description: "Users are responsible for ensuring they have rights to download content.",
      color: "text-yellow-400",
    },
    {
      icon: UserCheck,
      title: "Age Requirement",
      description: "Service is available to users of all ages with parental supervision for minors.",
      color: "text-pink-400",
    },
  ];

  const prohibitedUses = [
    "Downloading copyrighted content without permission",
    "Using the service for commercial purposes without authorization",
    "Attempting to reverse engineer or hack our systems",
    "Using automated tools or bots to make excessive requests",
    "Downloading private or restricted content",
    "Redistributing downloaded content without proper rights",
    "Using the service to violate any laws or regulations",
    "Attempting to overwhelm our servers with requests",
  ];

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 md:px-6 overflow-x-hidden">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <div className="mb-4 sm:mb-6">
          <div className="relative mx-auto w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
            <div className="relative flex items-center justify-center w-full h-full">
              <Scale className="text-white animate-pulse" size={32} />
            </div>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight md:leading-[1.1]">
          Terms & Conditions
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
          Welcome to{" "}
          <span className="text-purple-400 font-bold">VidOcean</span>! 
          These terms govern your use of our{" "}
          <span className="text-blue-400 font-bold">free video downloader service</span>. 
          By using VidOcean, you agree to these{" "}
          <span className="text-cyan-400 font-bold">simple and fair terms</span>.
        </p>

        {/* Terms Stats */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
          <span className="bg-purple-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-purple-300 flex items-center space-x-1 sm:space-x-2">
            <Scale size={14} />
            <span>Fair Terms</span>
          </span>
          <span className="bg-green-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-green-300 flex items-center space-x-1 sm:space-x-2">
            <Download size={14} />
            <span>Free Service</span>
          </span>
          <span className="bg-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-blue-300 flex items-center space-x-1 sm:space-x-2">
            <Shield size={14} />
            <span>User Protection</span>
          </span>
          <span className="bg-cyan-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-cyan-300 flex items-center space-x-1 sm:space-x-2">
            <Globe size={14} />
            <span>Global Access</span>
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

      {/* Key Terms Overview */}
      <div className="mb-10 sm:mb-12 md:mb-16">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Key Terms at a Glance
          </h2>
          <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto px-4">
            Here are the most important terms you should know before using VidOcean.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {keyTerms.map((term, index) => (
            <GlassCard
              key={index}
              className="p-4 sm:p-6 text-center hover:scale-100 sm:hover:scale-105 transition-transform duration-300"
            >
              <term.icon
                className={`mx-auto mb-3 sm:mb-4 ${term.color}`}
                size={36}
              />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                {term.title}
              </h3>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                {term.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Acceptance of Terms */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <CheckCircle className="text-green-400" />
          <span>Acceptance of Terms</span>
        </h2>
        
        <div className="space-y-4 text-blue-200 text-sm sm:text-base">
          <p className="leading-relaxed">
            By accessing and using VidOcean (<strong>vidocean.com</strong>), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.
          </p>
          
          <p className="leading-relaxed">
            These terms apply to all visitors, users, and others who access or use VidOcean, regardless of how you access the service (web browser, mobile device, API, etc.).
          </p>
          
          <p className="leading-relaxed">
            By using our service, you represent that you are at least 13 years of age or have parental consent, and have the legal capacity to enter into these terms in your jurisdiction.
          </p>
        </div>

        <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-400/30">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-green-300 font-bold mb-2">Simple Acceptance</h4>
              <p className="text-green-200 text-sm sm:text-base">
                Using VidOcean means you agree to these terms. We've made them as simple and fair as possible.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Service Description */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Download className="text-blue-400" />
          <span>Service Description</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              What VidOcean Provides
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Free online video downloading service</li>
              <li>• Support for 1000+ platforms and websites</li>
              <li>• Multiple quality and format options</li>
              <li>• Real-time download progress tracking</li>
              <li>• No registration or account required</li>
              <li>• Mobile and desktop compatibility</li>
              <li>• Audio-video synchronization</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Service Limitations
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Public content only</li>
              <li>• Subject to source platform availability</li>
              <li>• No guarantee of 100% uptime</li>
              <li>• File size and duration limits may apply</li>
              <li>• Rate limiting to prevent abuse</li>
              <li>• No permanent file storage</li>
              <li>• Platform support may change</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
          <div className="flex items-start space-x-3">
            <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-blue-300 font-bold mb-2">Service Evolution</h4>
              <p className="text-blue-200 text-sm sm:text-base">
                VidOcean is constantly evolving. We may add new features, platforms, or modify existing functionality to improve your experience.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* User Responsibilities */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <UserCheck className="text-purple-400" />
          <span>User Responsibilities</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              ✅ What You Should Do
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Only download content you have the right to access</li>
              <li>• Respect copyright laws and intellectual property rights</li>
              <li>• Use the service for personal, non-commercial purposes</li>
              <li>• Ensure content is publicly available before downloading</li>
              <li>• Follow the terms of service of source platforms</li>
              <li>• Report any technical issues or abuse</li>
              <li>• Keep your downloads for personal use only</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              📋 Your Legal Obligations
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Comply with all applicable local, national, and international laws</li>
              <li>• Obtain necessary permissions for copyrighted content</li>
              <li>• Respect privacy rights of content creators</li>
              <li>• Not use downloaded content for illegal purposes</li>
              <li>• Take responsibility for your downloads and their use</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-400/30">
          <div className="flex items-start space-x-3">
            <UserCheck className="text-purple-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-purple-300 font-bold mb-2">User Responsibility</h4>
              <p className="text-purple-200 text-sm sm:text-base">
                You are solely responsible for ensuring that your use of VidOcean and any downloaded content complies with applicable laws and regulations.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Prohibited Uses */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Ban className="text-red-400" />
          <span>Prohibited Uses</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-6 leading-relaxed">
          The following activities are strictly prohibited when using VidOcean:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {prohibitedUses.map((use, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-400/30">
              <XCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
              <span className="text-red-200 text-sm sm:text-base">{use}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-red-500/10 rounded-lg border border-red-400/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-red-300 font-bold mb-2">Consequences of Violations</h4>
              <p className="text-red-200 text-sm sm:text-base">
                Violating these prohibited uses may result in temporary or permanent restriction of access to VidOcean. We reserve the right to take appropriate action to protect our service and other users.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Intellectual Property */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Copyright className="text-yellow-400" />
          <span>Intellectual Property</span>
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              VidOcean's Intellectual Property
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• VidOcean website design, code, and functionality are owned by us</li>
              <li>• Our logo, branding, and trademarks are protected</li>
              <li>• You may not copy, modify, or distribute our code or design</li>
              <li>• All rights not expressly granted are reserved</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Third-Party Content
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Downloaded content belongs to its original creators/owners</li>
              <li>• VidOcean does not claim ownership of downloaded content</li>
              <li>• Users must respect copyright and intellectual property rights</li>
              <li>• We act as a technical tool, not a content distributor</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              DMCA Policy
            </h3>
            <p className="text-blue-200 text-sm sm:text-base leading-relaxed">
              We respect intellectual property rights and respond to valid DMCA takedown requests. 
              If you believe your copyrighted content is being downloaded through our service without permission, 
              please contact us with proper documentation.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-400/30">
          <div className="flex items-start space-x-3">
            <Copyright className="text-yellow-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-yellow-300 font-bold mb-2">Respect Copyright</h4>
              <p className="text-yellow-200 text-sm sm:text-base">
                VidOcean respects intellectual property rights. Users are responsible for ensuring they have the right to download and use any content.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Disclaimers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-2">
            <AlertTriangle className="text-orange-400" />
            <span>Disclaimers</span>
          </h2>
          
          <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={14} />
              <span>Service provided "as is" without warranties</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={14} />
              <span>No guarantee of continuous availability</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={14} />
              <span>Content availability depends on source platforms</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={14} />
              <span>No liability for content accuracy or quality</span>
            </li>
            <li className="flex items-start space-x-2">
              <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={14} />
              <span>Users responsible for legal compliance</span>
            </li>
          </ul>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-2">
            <Shield className="text-green-400" />
            <span>Limitation of Liability</span>
          </h2>
          
          <ul className="space-y-3 text-blue-200 text-sm sm:text-base">
            <li className="flex items-start space-x-2">
              <Shield className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>No liability for indirect or consequential damages</span>
            </li>
            <li className="flex items-start space-x-2">
              <Shield className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>Maximum liability limited to service access</span>
            </li>
            <li className="flex items-start space-x-2">
              <Shield className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>Not responsible for third-party platform issues</span>
            </li>
            <li className="flex items-start space-x-2">
              <Shield className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>No warranty on downloaded content</span>
            </li>
            <li className="flex items-start space-x-2">
              <Shield className="text-green-400 mt-1 flex-shrink-0" size={14} />
              <span>Users assume risk of content use</span>
            </li>
          </ul>
        </GlassCard>
      </div>

      {/* Service Availability */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Server className="text-cyan-400" />
          <span>Service Availability</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Our Commitment
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• We strive for maximum uptime and availability</li>
              <li>• Regular maintenance and updates for better performance</li>
              <li>• Quick response to technical issues</li>
              <li>• Continuous monitoring of service health</li>
              <li>• Platform compatibility updates</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
              Service Interruptions
            </h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Scheduled maintenance may cause temporary downtime</li>
              <li>• Third-party platform changes may affect functionality</li>
              <li>• Server issues may temporarily limit access</li>
              <li>• Heavy traffic may cause slower performance</li>
              <li>• No guarantee of 100% uptime</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-400/30">
          <div className="flex items-start space-x-3">
            <Server className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-cyan-300 font-bold mb-2">Best Effort Service</h4>
              <p className="text-cyan-200 text-sm sm:text-base">
                We provide VidOcean on a "best effort" basis. While we work hard to maintain reliability, we cannot guarantee uninterrupted service.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Privacy Reference */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Lock className="text-green-400" />
          <span>Privacy & Data Protection</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-6 leading-relaxed">
          Your privacy is extremely important to us. VidOcean is designed to be completely anonymous and privacy-friendly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">🔒 Privacy Highlights</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• No personal data collection</li>
              <li>• No user tracking or analytics</li>
              <li>• No cookies or persistent storage</li>
              <li>• Anonymous service usage</li>
              <li>• Automatic file deletion</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-4">📋 Full Details</h3>
            <p className="text-blue-200 text-sm sm:text-base mb-3">
              For complete information about how we protect your privacy:
            </p>
            <Link 
              href="/privacy-policy" 
              className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
            >
              <Lock size={16} />
              <span>Read our Privacy Policy</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Changes to Terms */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <RefreshCw className="text-blue-400" />
          <span>Changes to These Terms</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-4 leading-relaxed">
          We may update these Terms and Conditions from time to time to reflect changes in our service, legal requirements, or to improve clarity.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">How We Handle Updates</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• We will update the "Last Updated" date at the top of this page</li>
              <li>• Significant changes will be highlighted on our website</li>
              <li>• Major changes may be announced through our communication channels</li>
              <li>• Continued use of the service implies acceptance of updated terms</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Your Options</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Review terms periodically for updates</li>
              <li>• Discontinue use if you disagree with changes</li>
              <li>• Contact us if you have questions about updates</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
          <div className="flex items-start space-x-3">
            <RefreshCw className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="text-blue-300 font-bold mb-2">Fair Updates</h4>
              <p className="text-blue-200 text-sm sm:text-base">
                We are committed to making fair and reasonable updates to these terms. 
                We will never make changes that are detrimental to your experience without proper notice.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Contact Information */}
      <GlassCard className="p-4 sm:p-6 md:p-8 mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center space-x-3">
          <Mail className="text-pink-400" />
          <span>Contact Us</span>
        </h2>
        
        <p className="text-blue-200 text-sm sm:text-base mb-6 leading-relaxed">
          If you have any questions about these Terms and Conditions, our service, or need support, we're here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Questions About Terms</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Legal questions or clarifications</li>
              <li>• Terms interpretation</li>
              <li>• Compliance concerns</li>
              <li>• Rights and responsibilities</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Technical Support</h3>
            <ul className="space-y-2 text-blue-200 text-sm sm:text-base">
              <li>• Service issues or bugs</li>
              <li>• Download problems</li>
              <li>• Platform compatibility</li>
              <li>• Feature requests</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/about" 
            className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
          >
            <Mail size={20} />
            <span>Contact Developer</span>
            <ExternalLink size={16} />
          </Link>
        </div>
      </GlassCard>

      {/* Final CTA */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <GlassCard className="p-6 sm:p-8 md:p-12">
          <div className="mb-6">
            <Scale className="mx-auto text-purple-400 animate-pulse" size={48} />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Use VidOcean?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            By using our service, you agree to these fair and simple terms. 
            Start downloading videos from 1000+ platforms completely free!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-base sm:text-lg rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-100 sm:hover:scale-105 shadow-lg"
            >
              <Download size={20} />
              <span>Start Downloading Now</span>
            </Link>
            <Link
              href="/privacy-policy"
              className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border border-white/20 text-white font-bold text-base sm:text-lg rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <Lock size={20} />
              <span>View Privacy Policy</span>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
