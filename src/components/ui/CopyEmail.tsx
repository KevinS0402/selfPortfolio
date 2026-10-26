"use client";

import { trackPortfolioEvent } from "@/lib/portfolioAnalytics";
import { useState } from "react";

export function CopyEmail() {
  const [message, setMessage] = useState("");
  return <div className="copy-email"><button className="button button-secondary" type="button" onClick={async () => {
    try { await navigator.clipboard.writeText("kevin.song.1@vanderbilt.edu"); trackPortfolioEvent("email_copied"); setMessage("Email copied."); }
    catch { setMessage("Please use the email link or select the address to copy it."); }
  }}>{message === "Email copied." ? "Copied" : "Copy email"}</button><span className="copy-status" role="status">{message}</span></div>;
}
