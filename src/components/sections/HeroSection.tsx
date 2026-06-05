"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { profile } from "@/data/profile";
import { reveal, revealTransition, softSpring } from "@/lib/motion";
import { useHasMounted } from "@/lib/useHasMounted";

function ProfilePortrait() {
  const hasMounted = useHasMounted();
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 24, mass: 0.8 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 24, mass: 0.8 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-3, 3]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [3, -3]);
  const accentX = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const accentY = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={softSpring}
      className="relative mx-auto w-full max-w-[440px] lg:mx-0"
      onPointerMove={(event) => {
        if (reduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -right-4 top-10 h-28 w-28 rounded-full border border-gold/40"
        style={hasMounted && !reduceMotion ? { x: accentX, y: accentY } : undefined}
      />
      <motion.div
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-paper via-soft to-mist shadow-glow ring-1 ring-line"
        style={hasMounted && !reduceMotion ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      >
        {!imageFailed ? (
          <Image
            src={profile.profileImage}
            alt="Portrait of Kevin Song"
            fill
            priority
            sizes="(min-width: 1024px) 440px, 88vw"
            className="object-cover object-top"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="grid h-36 w-36 place-items-center rounded-full bg-paper text-5xl font-semibold text-charcoal shadow-sm ring-1 ring-line">
              KS
            </div>
          </div>
        )}
      </motion.div>
      <div className="mt-5 rounded-2xl bg-paper/80 px-5 py-4 shadow-sm backdrop-blur-md ring-1 ring-line/70">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
          <div>
            <p className="text-sm font-medium text-muted">Vanderbilt University</p>
            <p className="mt-1 text-base font-semibold text-charcoal md:text-lg">
              CS major, Business minor, 2027
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden bg-soft">
      <div className="mx-auto grid min-h-[calc(100vh-74px)] max-w-7xl content-center gap-12 px-5 py-12 md:px-8 md:py-20">
        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={revealTransition}
          className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_440px]"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-gold">Software, AI, and product</p>
            <h1 className="mt-5 text-[clamp(4rem,10vw,8.6rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-charcoal">
              Kevin Song
            </h1>
            <p className="mt-8 max-w-2xl text-2xl font-medium leading-tight tracking-[-0.02em] text-graphite md:text-4xl">
              Vanderbilt CS student building AI products, software tools, and accessible systems.
            </p>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
              Based across {profile.locations.join(", ")} with experience across cloud ML music
              analysis, computer vision accessibility tech, NIST research tooling, AI evaluation,
              and full-stack web products.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#projects" variant="primary">
                View projects
              </Button>
              <Button href="#contact" variant="secondary">
                Resume / contact
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-muted">
              {profile.roles.map((role) => (
                <span key={role} className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {role}
                </span>
              ))}
            </div>
          </div>
          <ProfilePortrait />
        </motion.div>

        <motion.div
          variants={reveal}
          initial="hidden"
          animate="visible"
          transition={{ ...revealTransition, delay: 0.15 }}
          className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-sm text-muted"
        >
          <p>
            {profile.university} / {profile.major} / {profile.minor} minor / GPA 3.70 / {profile.classYear}
          </p>
          <div className="flex gap-2">
            <Button
              href={profile.links.github}
              variant="ghost"
              className="min-h-10 px-4 py-2"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Button>
            <Button
              href={profile.links.linkedin}
              variant="ghost"
              className="min-h-10 px-4 py-2"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
