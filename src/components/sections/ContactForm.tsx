"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { trackPortfolioEvent } from "@/lib/portfolioAnalytics";
import { ContactCaptcha } from "@/components/ui/ContactCaptcha";
import { Arrow } from "@/components/ui/Arrow";
import { ContourField } from "@/components/ui/ContourField";
import { Reveal } from "@/components/ui/Reveal";

const CAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";

type FieldName = "name" | "email" | "subject" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const captchaToken = useRef("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const onCaptchaToken = useCallback((token: string) => { captchaToken.current = token; }, []);
  const submission = useRef<string | null>(null);
  const result = useRef<HTMLDivElement>(null);
  const formTarget = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formTarget.current;
    const page = form?.closest(".about-chapter");
    if (!form || !page) return;
    let frame = 0;
    let followingAnchor = false;
    function align() {
      frame = 0;
      if (!followingAnchor || window.location.hash !== "#contact-form") return;
      const margin = parseFloat(getComputedStyle(form!).scrollMarginTop) || 112;
      const top = window.scrollY + form!.getBoundingClientRect().top - margin;
      if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "instant" });
    }
    function schedule() { if (followingAnchor && !frame) frame = requestAnimationFrame(align); }
    function activate() {
      followingAnchor = window.location.hash === "#contact-form";
      if (followingAnchor) { form!.focus({ preventScroll: true }); schedule(); }
    }
    function clicked(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(anchor.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.hash === "#contact-form") {
        // Run after native fragment navigation, including a repeat click on the same hash.
        followingAnchor = true;
        requestAnimationFrame(activate);
      }
    }
    function stopFollowing() { followingAnchor = false; cancelAnimationFrame(frame); frame = 0; }
    // Sticky sections establish their full height during hydration. Keep this one
    // destination aligned while layout settles, then yield as soon as the user moves.
    const size = new ResizeObserver(schedule);
    size.observe(page);
    window.addEventListener("hashchange", activate);
    window.addEventListener("pageshow", activate);
    document.addEventListener("click", clicked);
    window.addEventListener("wheel", stopFollowing, { passive: true });
    window.addEventListener("touchmove", stopFollowing, { passive: true });
    window.addEventListener("keydown", stopFollowing);
    window.addEventListener("pointerdown", stopFollowing, { passive: true });
    void document.fonts.ready.then(schedule);
    activate();
    return () => {
      followingAnchor = false; cancelAnimationFrame(frame); size.disconnect();
      window.removeEventListener("hashchange", activate);
      window.removeEventListener("pageshow", activate);
      document.removeEventListener("click", clicked);
      window.removeEventListener("wheel", stopFollowing);
      window.removeEventListener("touchmove", stopFollowing);
      window.removeEventListener("keydown", stopFollowing);
      window.removeEventListener("pointerdown", stopFollowing);
    };
  }, []);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    if (!CAPTCHA_SITE_KEY || !captchaToken.current) {
      trackPortfolioEvent("contact_failed",{outcome:"captcha"});
      setStatus("error");
      setNotice(CAPTCHA_SITE_KEY ? "Please complete the reCAPTCHA check before sending." : "The contact form is temporarily unavailable. Please email me directly.");
      requestAnimationFrame(() => result.current?.focus({ preventScroll: true }));
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    submission.current ??= crypto.randomUUID();
    setStatus("sending"); setNotice(""); setErrors({});
    try {
      const response = await fetch("/api/contact/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), subject: data.get("subject"), message: data.get("message"), company: data.get("company"), submissionId: submission.current, captchaToken: captchaToken.current }),
      });
      const payload = await response.json();
      if (!response.ok || payload.ok !== true) {
        setErrors(payload.fields || {});
        throw new Error(typeof payload.error === "string" ? payload.error : "Your message couldn’t be sent. Please try again, or email me directly.");
      }
      trackPortfolioEvent("contact_submitted");
      form.reset(); submission.current = null;
      setStatus("sent"); setNotice("Message sent. Thanks for reaching out!");
    } catch (error) {
      trackPortfolioEvent("contact_failed",{outcome:"send_error"});
      setStatus("error");
      setNotice(error instanceof Error && error.name !== "TimeoutError" && error.name !== "AbortError" && error.name !== "SyntaxError" && error.name !== "TypeError" ? error.message : "Your message couldn’t be sent. Please try again, or email me directly.");
    }
    // Tokens are single-use, including when delivery fails after verification.
    captchaToken.current = "";
    setCaptchaReset(count => count + 1);
    requestAnimationFrame(() => result.current?.focus({ preventScroll: true }));
  }
  const hint = (field: FieldName) => errors[field] ? <span className="contact-field-error" id={`contact-${field}-error`}>{errors[field]}</span> : null;
  const description = (field: FieldName) => errors[field] ? `contact-${field}-error` : undefined;

  return <section className="container contact-section" aria-labelledby="contact-heading">
    <ContourField className="contact-contours"/><Reveal className="contact-intro"><h2 id="contact-heading">Something we should <em>build together?</em></h2><p>An idea, an opportunity, or a music rec. Say hi.</p><a className="text-link" href="mailto:kevin.song.1@vanderbilt.edu">Email me directly<Arrow direction="external" /></a></Reveal>
    <Reveal className="contact-panel liquid-glass"><form ref={formTarget} id="contact-form" className="contact-form-target" tabIndex={-1} aria-label="Send Kevin a message" onSubmit={send} onChange={() => { submission.current = null; if (status !== "sending") { setStatus("idle"); setNotice(""); } }} aria-busy={status === "sending"}>
      <fieldset disabled={status === "sending"}>
        <legend className="sr-only">Send Kevin a message</legend>
        <div className="contact-field-pair">
          <label htmlFor="contact-name"><span>Your name</span><input id="contact-name" name="name" autoComplete="name" required maxLength={100} placeholder="Your name" aria-invalid={Boolean(errors.name)} aria-describedby={description("name")} />{hint("name")}</label>
          <label htmlFor="contact-email"><span>Email</span><input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={description("email")} />{hint("email")}</label>
        </div>
        <label htmlFor="contact-subject"><span>What’s it about? <small>Optional</small></span><input id="contact-subject" name="subject" maxLength={120} placeholder="An idea, an opportunity, a hello…" aria-invalid={Boolean(errors.subject)} aria-describedby={description("subject")} />{hint("subject")}</label>
        <label htmlFor="contact-message"><span>Your message</span><textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Tell me what you have in mind." aria-invalid={Boolean(errors.message)} aria-describedby={description("message")} />{hint("message")}</label>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-company">Company website<input id="contact-company" name="company" autoComplete="off" tabIndex={-1} /></label></div>
        {CAPTCHA_SITE_KEY ? <ContactCaptcha siteKey={CAPTCHA_SITE_KEY} onToken={onCaptchaToken} resetCount={captchaReset} /> : <p className="contact-captcha-note">The contact form is temporarily unavailable. Please use the direct email link.</p>}
        <div className="contact-actions"><button className="button button-primary" type="submit" disabled={status === "sending" || !CAPTCHA_SITE_KEY}>{status === "sending" ? "Sending…" : "Send a note"}<Arrow /></button><span>Straight to my inbox.</span></div>
      </fieldset>
      <div ref={result} tabIndex={-1} className={`contact-result ${status === "error" ? "is-error" : ""}`} role="status" aria-live="polite" aria-atomic="true">{status === "sent" && <svg className="sent-airplane" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 20 37-13-13 36-8-16-16-7Zm16 7L42 7m-21 20-2 10 8-6"/></svg>}{notice}{status === "error" && <a href="mailto:kevin.song.1@vanderbilt.edu">Email me directly<Arrow direction="external" /></a>}</div>
    </form></Reveal>
  </section>;
}
