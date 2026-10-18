"use client";

import Link from "next/link";
import Image from "next/image";
import { media } from "@/data/media";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chapters } from "@/data/journey";
import { Arrow } from "@/components/ui/Arrow";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const resize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("keydown", escape);
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("keydown", escape); window.removeEventListener("resize", resize); };
  }, [open]);
  const active = (href: string) => pathname === href || pathname === href.slice(0, -1) || (href === "/engineering/" && pathname.startsWith("/work/"));
  return <header className="site-header"><div className="container header-inner"><Link href="/" className="wordmark" onClick={() => setOpen(false)}><Image className="site-monogram" src={media.monogram} alt="" width={42} height={42} priority /><span className="wordmark-name">Kevin <span className="wordmark-song">Song</span></span></Link><nav className="desktop-nav" aria-label="Primary navigation">{chapters.map((chapter) => <Link key={chapter.href} href={chapter.href} aria-current={active(chapter.href) ? "page" : undefined}>{chapter.label}</Link>)}</nav><div className="header-actions"><a href="/kevin-song-resume-2026-cs-pm.pdf" className="resume-link" target="_blank" rel="noreferrer">Resume<Arrow direction="external" /><span className="sr-only"> (PDF, opens in a new tab)</span></a><button ref={toggle} type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span className={open ? "menu-mark is-open" : "menu-mark"} aria-hidden="true"><i /><i /></span></button></div></div><nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>{chapters.map((chapter) => <Link key={chapter.href} href={chapter.href} aria-current={active(chapter.href) ? "page" : undefined} onClick={() => setOpen(false)}><span>{chapter.number}</span>{chapter.label}<Arrow /></Link>)}<Link href="/about/#contact-form" onClick={() => setOpen(false)}>Get in touch<Arrow /></Link></nav><noscript><nav className="no-script-nav" aria-label="Chapters">{chapters.map(chapter => <a key={chapter.href} href={chapter.href}>{chapter.label}</a>)}</nav></noscript></header>;
}
