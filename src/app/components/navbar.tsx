"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "../components/ui/glass-card";
import {
  Home,
  Download,
  Menu,
  X,
  Instagram,
  Facebook,
  Youtube,
  Info,
  Waves,
  ChevronDown,
  Music,
} from "lucide-react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Instagram, label: "Instagram", href: "/instagram" },
    { icon: Facebook, label: "Facebook", href: "/facebook" },
    { icon: Youtube, label: "YouTube", href: "/youtube" },
    { icon: Music, label: "TikTok", href: "/tiktok" },
  ];

  const menuItems = [
    { icon: Info, label: "About", href: "/about" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navbar (Large screens lg:) */}
      <nav className="hidden lg:block fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-auto">
        <GlassCard className="px-8 py-4 border border-cyan-400/20">
          <div className="flex items-center space-x-8">
            {/* 🌊 FIXED LOGO - vidocean with Waves icon */}
            <Link
              href="/"
              className="flex items-center space-x-3 whitespace-nowrap group"
            >
              <div className="relative">
                <Waves size={28} className="text-cyan-400 group-hover:text-cyan-300 transition-all duration-300 animate-pulse" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all duration-300"></div>
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
                vidocean
              </span>
            </Link>

            {/* Main Navigation */}
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-all duration-300 flex items-center space-x-2 hover:scale-105 px-4 py-2 rounded-lg ${
                    isActive(item.href)
                      ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/40 shadow-lg shadow-cyan-400/20"
                      : "text-blue-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Secondary Navigation */}
            <div className="flex space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-all duration-300 flex items-center space-x-2 hover:scale-105 px-4 py-2 rounded-lg ${
                    isActive(item.href)
                      ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/40 shadow-lg shadow-cyan-400/20"
                      : "text-blue-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </GlassCard>
      </nav>

      {/* Medium Devices Navbar (Tablets md: to lg:) */}
      <nav className="hidden md:block lg:hidden fixed top-4 left-4 right-4 z-50">
        <GlassCard className="px-6 py-3 border border-cyan-400/20">
          <div className="flex items-center justify-between">
            {/* 🌊 FIXED LOGO - Tablet version */}
            <Link
              href="/"
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <Waves size={24} className="text-cyan-400 group-hover:text-cyan-300 transition-all duration-300" />
                <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md group-hover:bg-cyan-300/30 transition-all duration-300"></div>
              </div>
              <span className="text-white font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
                vidocean
              </span>
            </Link>

            {/* Compact Navigation */}
            <div className="flex items-center space-x-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`transition-all duration-300 flex items-center justify-center p-2 rounded-lg hover:scale-105 ${
                    isActive(item.href)
                      ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/40"
                      : "text-blue-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                  }`}
                  title={item.label}
                >
                  <item.icon size={20} />
                </Link>
              ))}

              {/* Dropdown Menu */}
              {menuItems.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`transition-all duration-300 flex items-center space-x-1 px-3 py-2 rounded-lg hover:scale-105 ${
                      isDropdownOpen ||
                      menuItems.some((item) => isActive(item.href))
                        ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/40"
                        : "text-blue-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                    }`}
                  >
                    <Menu size={18} />
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>

                      <div className="absolute right-0 top-full mt-2 z-50">
                        <GlassCard className="py-2 min-w-[200px] border border-cyan-400/20">
                          {menuItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className={`flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-all duration-300 ${
                                isActive(item.href)
                                  ? "text-cyan-400 bg-cyan-400/20"
                                  : "text-blue-200 hover:text-white"
                              }`}
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <item.icon size={18} />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          ))}
                        </GlassCard>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </nav>

      {/* Mobile Bottom Navbar (Small screens) - NO TOP MARGIN ISSUES */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <GlassCard className="px-2 py-3 border border-cyan-400/20">
          <div className="flex justify-around items-center">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`transition-all duration-300 flex flex-col items-center space-y-1 hover:scale-110 p-2 rounded-lg ${
                  isActive(item.href)
                    ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/30"
                    : "text-blue-200 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-all duration-300 flex flex-col items-center space-y-1 hover:scale-110 p-2 rounded-lg ${
                isMenuOpen
                  ? "text-cyan-400 bg-cyan-400/20 border border-cyan-400/30"
                  : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </GlassCard>
      </nav>

      {/* Mobile Menu Overlay - IMPROVED SPACING */}
      {isMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* 🔥 FIXED - Better positioning without top margin issues */}
          <div className="md:hidden fixed bottom-20 left-4 right-4 z-50">
            <GlassCard className="p-6 border border-cyan-400/20">
              {/* Menu Header with vidocean logo */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 group">
                  <div className="relative">
                    <Waves size={28} className="text-cyan-400 animate-pulse" />
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg"></div>
                  </div>
                  <span className="text-white font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    vidocean
                  </span>
                </div>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-blue-200 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {/* TikTok Link */}
                <Link
                  href="/tiktok"
                  className={`transition-all duration-300 flex items-center space-x-3 p-4 rounded-xl hover:bg-white/10 border ${
                    isActive("/tiktok")
                      ? "text-cyan-400 bg-cyan-400/20 border-cyan-400/40"
                      : "text-blue-200 hover:text-white border-transparent hover:border-white/20"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Music size={22} />
                  <div className="flex-1">
                    <span className="font-medium text-lg">TikTok</span>
                    <p className="text-xs text-blue-200/70 mt-1">
                      Download TikTok videos without watermark
                    </p>
                  </div>
                </Link>

                {/* About Link */}
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`transition-all duration-300 flex items-center space-x-3 p-4 rounded-xl hover:bg-white/10 border ${
                      isActive(item.href)
                        ? "text-cyan-400 bg-cyan-400/20 border-cyan-400/40"
                        : "text-blue-200 hover:text-white border-transparent hover:border-white/20"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon size={22} />
                    <div className="flex-1">
                      <span className="font-medium text-lg">{item.label}</span>
                      <p className="text-xs text-blue-200/70 mt-1">
                        Learn more about vidocean
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Menu Footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center space-x-2 text-blue-200/50">
                  <span className="text-xs">Powered by Ocean Technology</span>
                  <Waves size={14} className="text-cyan-400/50" />
                </div>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </>
  );
}
