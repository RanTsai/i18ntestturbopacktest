// app/components/nav/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-[112px] rounded-full bg-accent/50" />;

  const isDark = theme === "dark" || (theme === "system" && resolvedTheme === "dark");

  // 容器: 寬 112、左右內距 12（px-3）、thumb 寬 28（w-7）
  // 可滑動距離 = 112 - 24 - 28 = 60
  const thumbX = isDark ? 60 : 0;

  const handleClick = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={handleClick}
    
      className="relative inline-flex items-center h-9 w-[112px] px-3 rounded-full border bg-background text-foreground overflow-hidden"
    >
      {/* 左/右兩側的文字——只切換透明度，不改 layout */}
      <span
        className={`pointer-events-none text-sm transition-opacity duration-200 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        Dark
      </span>
      <span className="flex-1" />
      <span
        className={`pointer-events-none text-sm transition-opacity duration-200 ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      >
        Light
      </span>

      {/* 滑塊（thumb）：在容器內左右滑動，不會跳出容器 */}
      <motion.div
        className="absolute top-1 left-1 w-7 h-7 rounded-full border flex items-center justify-center"
        animate={{ x: thumbX }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
      >
        {/* Icon 在 thumb 內淡入淡出，不改位置 */}
        <motion.span
          key="moon"
          className="absolute"
          animate={{ opacity: isDark ? 1 : 0, rotate: isDark ? 0 : -10 }}
          transition={{ duration: 0.18 }}
        >
          <Moon className="h-5 w-5" />
        </motion.span>
        <motion.span
          key="sun"
          className="absolute"
          animate={{ opacity: isDark ? 0 : 1, rotate: isDark ? 10 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <Sun className="h-5 w-5" />
        </motion.span>
      </motion.div>
    </button>
  );
}
