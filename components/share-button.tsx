"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { getIdentity, trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
export function ShareButton() {
  const [message, setMessage] = useState("");
  async function share() {
    const url = new URL("/", window.location.origin);
    url.searchParams.set("ref", getIdentity().anon_user_id);
    trackEvent("share_or_conversion_clicked", { channel: typeof navigator.share === "function" ? "native" : "copy" });
    try {
      if (navigator.share) {
        await navigator.share({ title: "Go from idea to first users", text: "Make a small plan. Launch something useful.", url: url.toString() });
        setMessage("Shared.");
      } else {
        await navigator.clipboard.writeText(url.toString());
        setMessage("Referral link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try { await navigator.clipboard.writeText(url.toString()); setMessage("Referral link copied."); }
      catch { setMessage(url.toString()); }
    }
  }
  return <div className="min-w-0"><Button variant="outline" onClick={share}><Share2 size={16} /> Share with a friend</Button><p role="status" className="mt-2 break-anywhere text-xs text-muted-foreground">{message}</p></div>;
}
