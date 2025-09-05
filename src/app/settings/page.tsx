"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "../components/ui/glass-card";
import {
  Settings,
  Palette,
  Download,
  Shield,
  Trash2,
  Database,
  Info,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface SettingsData {
  theme: "ocean" | "dark" | "light";
  downloadQuality: "auto" | "hd" | "sd";
  autoDownload: boolean;
  soundEffects: boolean;
  notifications: boolean;
  saveHistory: boolean;
  language: "en" | "hi" | "es";
  maxConcurrentDownloads: number;
}

const defaultSettings: SettingsData = {
  theme: "ocean",
  downloadQuality: "hd",
  autoDownload: false,
  soundEffects: true,
  notifications: true,
  saveHistory: true,
  language: "en",
  maxConcurrentDownloads: 3,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("socialsnatch-settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed }); // Merge with defaults for new settings
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Auto-save settings to localStorage whenever settings change (except on initial load)
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      try {
        localStorage.setItem("socialsnatch-settings", JSON.stringify(settings));
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    }
  }, [settings, loading]);

  const updateSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("socialsnatch-settings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    }
  };

  const resetSettings = () => {
    if (
      confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone."
      )
    ) {
      setSettings(defaultSettings);
      try {
        localStorage.setItem(
          "socialsnatch-settings",
          JSON.stringify(defaultSettings)
        );
      } catch (error) {
        console.error("Error resetting settings:", error);
      }
    }
  };

  const clearCache = () => {
    if (
      confirm(
        "Are you sure you want to clear all cached data and download history? This action cannot be undone."
      )
    ) {
      try {
        // Clear different types of cached data
        localStorage.removeItem("socialsnatch-cache");
        localStorage.removeItem("socialsnatch-history");
        localStorage.removeItem("socialsnatch-downloads");
        localStorage.removeItem("socialsnatch-temp");

        // Clear any session storage as well
        if (typeof window !== "undefined" && window.sessionStorage) {
          sessionStorage.removeItem("socialsnatch-session");
        }

        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 3000);
      } catch (error) {
        console.error("Error clearing cache:", error);
        alert("Error clearing cache. Please try again.");
      }
    }
  };

  const getStorageSize = () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (
          localStorage.hasOwnProperty(key) &&
          key.startsWith("socialsnatch")
        ) {
          total += localStorage[key].length;
        }
      }
      return (total / 1024).toFixed(2) + " KB";
    } catch {
      return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Settings
            className="mx-auto mb-4 text-cyan-400 animate-spin"
            size={48}
          />
          <p className="text-blue-100">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4">
      {/* Settings Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <Settings
            className="mx-auto mb-4 text-cyan-400 animate-pulse"
            size={64}
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
          Customize your{" "}
          <span className="text-cyan-400 font-bold">SocialSnatch</span>{" "}
          experience
        </p>
      </div>

      <div className="grid gap-8 mb-8">
        {/* Appearance Settings */}
        <GlassCard className="p-6 border-l-4 border-l-cyan-400">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
            <Palette className="text-cyan-400" size={28} />
            <span>Appearance</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-blue-100 font-medium mb-3 block">
                Theme
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "ocean",
                    label: "🌊 Ocean (Current)",
                    color: "cyan",
                  },
                  { value: "dark", label: "🌙 Dark Mode", color: "gray" },
                  { value: "light", label: "☀️ Light Mode", color: "yellow" },
                ].map((theme) => (
                  <label
                    key={theme.value}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={settings.theme === theme.value}
                      onChange={(e) =>
                        updateSetting(
                          "theme",
                          e.target.value as SettingsData["theme"]
                        )
                      }
                      className="text-cyan-400 focus:ring-cyan-500"
                    />
                    <span className="text-blue-200">{theme.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-blue-100 font-medium mb-3 block">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) =>
                  updateSetting(
                    "language",
                    e.target.value as SettingsData["language"]
                  )
                }
                className="w-full p-3 rounded-lg bg-black/40 border border-blue-300/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300"
              >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिन्दी</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Download Settings */}
        <GlassCard className="p-6 border-l-4 border-l-blue-400">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
            <Download className="text-blue-400" size={28} />
            <span>Download Preferences</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-blue-100 font-medium mb-3 block">
                Default Quality
              </label>
              <select
                value={settings.downloadQuality}
                onChange={(e) =>
                  updateSetting(
                    "downloadQuality",
                    e.target.value as SettingsData["downloadQuality"]
                  )
                }
                className="w-full p-3 rounded-lg bg-black/40 border border-blue-300/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value="auto">🤖 Auto (Recommended)</option>
                <option value="hd">📺 HD Quality</option>
                <option value="sd">📱 Standard Quality</option>
              </select>
            </div>

            <div>
              <label className="text-blue-100 font-medium mb-3 block">
                Max Concurrent Downloads
              </label>
              <select
                value={settings.maxConcurrentDownloads}
                onChange={(e) =>
                  updateSetting(
                    "maxConcurrentDownloads",
                    Number(e.target.value)
                  )
                }
                className="w-full p-3 rounded-lg bg-black/40 border border-blue-300/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                <option value={1}>1 Download</option>
                <option value={3}>3 Downloads (Recommended)</option>
                <option value={5}>5 Downloads</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300">
              <input
                type="checkbox"
                checked={settings.autoDownload}
                onChange={(e) =>
                  updateSetting("autoDownload", e.target.checked)
                }
                className="text-blue-400 focus:ring-blue-500 rounded"
              />
              <div>
                <span className="text-blue-100 font-medium">Auto Download</span>
                <p className="text-blue-200/70 text-sm">
                  Automatically start downloads when URL is detected
                </p>
              </div>
            </label>
          </div>
        </GlassCard>

        {/* Privacy & Data */}
        <GlassCard className="p-6 border-l-4 border-l-teal-400">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
            <Shield className="text-teal-400" size={28} />
            <span>Privacy & Data</span>
          </h2>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300">
              <input
                type="checkbox"
                checked={settings.saveHistory}
                onChange={(e) => updateSetting("saveHistory", e.target.checked)}
                className="text-teal-400 focus:ring-teal-500 rounded"
              />
              <div>
                <span className="text-blue-100 font-medium">
                  Save Download History
                </span>
                <p className="text-blue-200/70 text-sm">
                  Keep a record of your downloaded content
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  updateSetting("notifications", e.target.checked)
                }
                className="text-teal-400 focus:ring-teal-500 rounded"
              />
              <div>
                <span className="text-blue-100 font-medium">
                  Browser Notifications
                </span>
                <p className="text-blue-200/70 text-sm">
                  Get notified when downloads complete
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-300">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) =>
                  updateSetting("soundEffects", e.target.checked)
                }
                className="text-teal-400 focus:ring-teal-500 rounded"
              />
              <div>
                <span className="text-blue-100 font-medium">Sound Effects</span>
                <p className="text-blue-200/70 text-sm">
                  Play sounds for download events
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h3 className="text-red-300 font-bold mb-2 flex items-center space-x-2">
              <Trash2 size={20} />
              <span>Data Management</span>
            </h3>
            <p className="text-red-200/80 text-sm mb-4">
              Clear cached data and download history. This action cannot be
              undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Clear All Data</span>
              </button>
              {cacheCleared && (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">Cache cleared successfully!</span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Advanced Settings */}
        <GlassCard className="p-6 border-l-4 border-l-purple-400">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
            <Database className="text-purple-400" size={28} />
            <span>Advanced</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-blue-100 font-medium mb-3">
                  App Statistics
                </h3>
                <div className="space-y-2 text-sm text-blue-200/70 bg-black/20 p-4 rounded-lg">
                  <p>• Cache Size: {getStorageSize()}</p>
                  <p>• Settings: {Object.keys(settings).length} options</p>
                  <p>
                    • Auto-save:{" "}
                    {settings.autoDownload ? "Enabled" : "Disabled"}
                  </p>
                  <p>• Last Updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-blue-100 font-medium mb-3">
                  Developer Options
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="text-purple-400 focus:ring-purple-500 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          console.log("Debug mode enabled", settings);
                        }
                      }}
                    />
                    <span className="text-blue-200 text-sm">
                      Enable Debug Mode
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="text-purple-400 focus:ring-purple-500 rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          console.log("Console logs enabled");
                        }
                      }}
                    />
                    <span className="text-blue-200 text-sm">
                      Show Console Logs
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={saveSettings}
          className={`px-6 py-3 ${
            saved
              ? "bg-green-500 shadow-lg shadow-green-500/20"
              : "bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/20"
          } text-white font-bold rounded-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105`}
        >
          {saved ? <CheckCircle size={20} /> : <Save size={20} />}
          <span>{saved ? "Settings Saved!" : "Manual Save"}</span>
        </button>

        <button
          onClick={resetSettings}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
        >
          <RotateCcw size={20} />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* Auto-save indicator */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 text-blue-200/50 bg-black/20 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <span className="text-xs">Settings auto-save enabled</span>
        </div>
      </div>
    </div>
  );
}
