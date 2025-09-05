"use client";

import React from 'react';

const OceanBackground = () => {
  // 150+ Ocean-themed mini icons using Lucide React components and symbols
  const oceanIcons = [
    // Tech & Digital (40 icons)
    '📱', '💻', '🖥️', '⌚', '🎧', '📷', '📹', '🎮', '🕹️', '💿',
    '📀', '💾', '💽', '🖨️', '⌨️', '🖱️', '🖲️', '💡', '🔋', '🔌',
    '📡', '📶', '📳', '📴', '🔊', '🔉', '🔈', '🔇', '📢', '📣',
    '📯', '🔔', '🔕', '🎵', '🎶', '🎼', '🎹', '🥁', '🎸', '🎺',
    
    // Ocean & Nature (30 icons)
    '🌊', '🐠', '🐟', '🦈', '🐙', '🦑', '🐚', '🦀', '🦞', '🐢',
    '🐳', '🐋', '🏖️', '🏝️', '⚓', '🚢', '⛵', '🛥️', '🚤', '🛟',
    '🏄', '🏊', '🤿', '🌅', '🌄', '🌊', '💧', '💦', '❄️', '☔',
    
    // Cosmic & Space (25 icons)
    '⭐', '🌟', '✨', '💫', '🌙', '🌛', '🌜', '🌚', '🌝', '🌞',
    '☀️', '⛅', '⭐', '🌠', '🔮', '💎', '💍', '👑', '🏆', '🥇',
    '🏅', '🎖️', '🎗️', '🎫', '🎟️',
    
    // Geometric & Symbols (30 icons)
    '🔷', '🔶', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '⚪', '⚫',
    '🟤', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟥', '🟧', '🟨',
    '🟩', '🟦', '🟪', '⬛', '⬜', '◼️', '◻️', '▪️', '▫️', '🔳',
    
    // Communication & Social (25 icons)
    '💬', '💭', '🗯️', '💌', '💝', '💖', '💕', '💗', '💓', '💔',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❣️',
    '💟', '☮️', '✝️', '☪️', '🕉️'
  ];

  // Generate 150+ random positioned icons
  const generateRandomIcon = (index: number) => {
    const randomIcon = oceanIcons[Math.floor(Math.random() * oceanIcons.length)];
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const randomDelay = Math.random() * 15;
    const randomDuration = 12 + Math.random() * 18; // 12-30 seconds
    const randomScale = 0.3 + Math.random() * 0.6; // 0.3x to 0.9x size
    const randomOpacity = 0.1 + Math.random() * 0.2; // 0.1 to 0.3 opacity

    // Ocean color variants
    const oceanColors = [
      'text-cyan-300/40',
      'text-blue-300/40', 
      'text-teal-300/40',
      'text-sky-300/40',
      'text-indigo-300/40',
      'text-slate-300/40'
    ];
    const randomColor = oceanColors[Math.floor(Math.random() * oceanColors.length)];

    return (
      <div
        key={index}
        className={`absolute animate-float-slow ${randomColor} pointer-events-none select-none`}
        style={{
          left: `${randomX}%`,
          top: `${randomY}%`,
          animationDelay: `${randomDelay}s`,
          animationDuration: `${randomDuration}s`,
          transform: `scale(${randomScale})`,
          opacity: randomOpacity,
          fontSize: '1.2rem',
          zIndex: 1,
        }}
      >
        {randomIcon}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Generate 150 random icons */}
      {Array.from({ length: 150 }, (_, i) => generateRandomIcon(i))}
    </div>
  );
};

export default OceanBackground;
