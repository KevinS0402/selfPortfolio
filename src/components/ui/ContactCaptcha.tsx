"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type CaptchaApi = {
  ready: (callback: () => void) => void;
  render: (element: HTMLElement, options: {
    sitekey: string; theme: "dark"; size: "compact";
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
  }) => number;
  reset: (id: number) => void;
};
declare global { interface Window { grecaptcha?: CaptchaApi; portfolioCaptchaReady?: () => void } }

export function ContactCaptcha({ siteKey, onToken, resetCount }: {
  siteKey: string; onToken: (token: string) => void; resetCount: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "expired" | "error">("loading");

  useEffect(() => {
    const api = window.grecaptcha;
    const container = host.current;
    if (!ready || !api || !container) return;
    let active = true;
    const target = document.createElement("div");
    container.append(target);
    api.ready(() => {
      if (!active) return;
      try {
        widget.current = api.render(target, {
          sitekey: siteKey, theme: "dark", size: "compact",
          callback: token => { if (active) { onToken(token); setState("ready"); } },
          "expired-callback": () => { if (active) { onToken(""); setState("expired"); } },
          "error-callback": () => { if (active) { onToken(""); setState("error"); } },
        });
        setState("ready");
      } catch { setState("error"); }
    });
    return () => {
      active = false;
      if (widget.current !== null) { api.reset(widget.current); widget.current = null; }
      target.remove();
    };
  }, [ready, siteKey, onToken]);

  useEffect(() => {
    if (resetCount > 0 && widget.current !== null) {
      window.grecaptcha?.reset(widget.current);
      onToken("");
    }
  }, [resetCount, onToken]);

  useEffect(() => {
    const loaded = () => setReady(true);
    window.portfolioCaptchaReady = loaded;
    if (window.grecaptcha?.render) window.grecaptcha.ready(loaded);
    return () => { if (window.portfolioCaptchaReady === loaded) delete window.portfolioCaptchaReady; };
  }, []);

  useEffect(() => {
    if (ready) return;
    const timer = window.setTimeout(() => setState("error"), 15_000);
    return () => window.clearTimeout(timer);
  }, [ready]);

  return <div className="contact-captcha" role="group" aria-label="Spam protection">
    <Script id="contact-recaptcha" src="https://www.google.com/recaptcha/api.js?onload=portfolioCaptchaReady&render=explicit"
      strategy="lazyOnload"
      onReady={() => { if (window.grecaptcha?.render) setReady(true); }}
      onError={() => { onToken(""); setState("error"); }} />
    <div ref={host} />
    <p className="contact-captcha-note" role="status" aria-live="polite">
      {state === "loading" && "Loading spam protection…"}
      {state === "expired" && "The check expired. Please complete reCAPTCHA again."}
      {state === "error" && "Spam protection couldn’t load. Reload the page, or email me directly."}
    </p>
  </div>;
}
