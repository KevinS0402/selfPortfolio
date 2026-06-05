"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useHasMounted } from "@/lib/useHasMounted";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-charcoal text-paper shadow-glow hover:bg-graphite",
  secondary:
    "bg-paper text-charcoal ring-1 ring-line hover:ring-gold/50",
  ghost:
    "bg-transparent text-graphite hover:bg-mist hover:text-charcoal",
};

export function Button({ children, href, variant = "primary", className = "", ...props }: ButtonProps) {
  const hasMounted = useHasMounted();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 24, mass: 0.8 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 24, mass: 0.8 });
  const x = useTransform(springX, [-1, 1], [-4, 4]);
  const y = useTransform(springY, [-1, 1], [-3, 3]);

  return (
    <Link
      href={href}
      className={`group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-5 py-3 text-sm font-semibold tracking-normal transition duration-300 ${variants[variant]} ${className}`}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
      {...props}
    >
      <motion.span className="relative z-10" style={hasMounted ? { x, y } : undefined}>
        {children}
      </motion.span>
      <span
        aria-hidden="true"
        className="absolute inset-x-5 bottom-2 h-px origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100"
      />
    </Link>
  );
}
