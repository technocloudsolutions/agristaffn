"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-[80px] h-[40px] rounded-full overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Background */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-sky-300'
      }`} />

      {/* Sun/Moon Container */}
      <div className={`absolute inset-[4px] w-[32px] h-[32px] rounded-full transition-all duration-500 ${
        theme === 'dark' 
          ? 'translate-x-[40px] bg-slate-800' 
          : 'translate-x-0 bg-yellow-300'
      }`}>
        {/* Sun rays or Moon details */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          theme === 'dark' ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Moon surface details */}
          <div className="absolute top-[8px] left-[8px] w-[4px] h-[4px] rounded-full bg-slate-600" />
          <div className="absolute top-[15px] left-[15px] w-[6px] h-[6px] rounded-full bg-slate-600" />
        </div>

        {/* Sun rays */}
        <div className={`absolute inset-0 transition-all duration-500 ${
          theme === 'dark' ? 'opacity-0' : 'opacity-100'
        }`}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-[2px] h-[6px] bg-yellow-500 origin-bottom"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${i * 45}deg) translateY(-18px)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Stars (visible in dark mode) */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${
        theme === 'dark' ? 'opacity-100' : 'opacity-0'
      }`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full"
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${1 + Math.random() * 2}s infinite`
            }}
          />
        ))}
      </div>
    </button>
  );
} 