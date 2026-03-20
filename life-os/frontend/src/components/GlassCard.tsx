"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  hover = true,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={clsx(
        "rounded-2xl border border-glass-border bg-glass backdrop-blur-md",
        "p-6 shadow-card transition-colors",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
