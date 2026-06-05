"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

type AnimatedUnderlineProps = {
  href: string;
  children: ReactNode;
};

export function AnimatedUnderline({ href, children }: AnimatedUnderlineProps) {
  return (
    <Link
      href={href}
      className="group relative inline-flex px-1 py-2 text-sm font-medium text-muted transition hover:text-charcoal"
    >
      {children}
      <motion.span
        aria-hidden="true"
        className="absolute bottom-1 left-0 h-px w-full origin-left bg-gold"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        whileFocus={{ scaleX: 1 }}
        transition={{ duration: 0.24 }}
      />
    </Link>
  );
}
