"use client";

import { motion, useScroll } from "framer-motion";
import { LivingSurface } from "./LivingSurface";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteJourney({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const {scrollYProgress}=useScroll();
  return <>
    <motion.div className="reading-progress" style={{scaleX:scrollYProgress}} aria-hidden="true" />
    <LivingSurface key={pathname}>{children}</LivingSurface>
  </>;
}
