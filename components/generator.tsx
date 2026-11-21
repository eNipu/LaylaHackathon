"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ArrowRight, Sparkles, LoaderCircle } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-button";
import { ShareButton } from "@/components/share-button";
import { rise } from "@/components/motion-provider";
import { trackEvent } from "@/lib/analytics";
import { DEMO_RESULT, EXAMPLE, type GenerationChunk } from "@/lib/generation";
import { site } from "@/lib/site-config";

const copy = site.generator;

export function Generator() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const result = useRef<HTMLElement>(null);
  const running = useRef(false);

  // On phones the result appears below the fold; bring it into view once streaming starts.
  useEffect(() => {
    if (!busy) return;
    const id = requestAnimationFrame(() => {
      const el = result.current;
      if (el && el.getBoundingClientRect().top > window.innerHeight * 0.75) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [busy]);

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (running.current || !prompt.trim()) return;
    running.current = true;
    setBusy(true); setOutput(""); setMode(null); setError("");
    trackEvent("core_action_started");
    let terminal = false;
    try {
      const response = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }), signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok || !response.body) throw new Error("Generation unavailable.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      const consume = (line: string) => {
        if (!line.trim()) return;
        const chunk = JSON.parse(line) as GenerationChunk;
        if (chunk.type === "text") setOutput(value => value + chunk.text);
        if (chunk.type === "fallback") {
          terminal = true; setMode("demo"); setOutput(chunk.text);
          setError("AI is unavailable right now. This is a saved example, not a personalized result.");
          trackEvent("core_action_completed", { mode: "demo" });
        }
        if (chunk.type === "done") {
          terminal = true; setMode("live"); trackEvent("core_action_completed", { mode: "live" });
        }
      };
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        lines.forEach(consume);
      }
      buffer += decoder.decode();
      if (buffer.trim()) consume(buffer);
      if (!terminal) throw new Error("The stream ended early.");
    } catch {
      setMode("demo"); setOutput(DEMO_RESULT);
      setError("Connection interrupted. Here is a saved example so you can still explore.");
    } finally { running.current = false; setBusy(false); }
  }

  const statusLabel = busy ? "Streaming" : mode === "demo" ? "Saved demo example" : "Made for your idea";

  return <div className="min-w-0">
    <m.form variants={rise} onSubmit={generate} className="relative rounded-[1.75rem] border border-border bg-surface/85 p-4 shadow-[0_1px_0_rgb(255_255_255)_inset,0_30px_60px_-30px_rgb(10_10_11/0.25)] backdrop-blur-xl sm:p-6">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <label htmlFor="idea" className="text-sm font-semibold">{copy.label}</label>
        <span className="text-xs tabular-nums text-muted-foreground">{prompt.length.toLocaleString()} / 2,000</span>
      </div>
      <textarea
        ref={input} id="idea" value={prompt} onChange={e => setPrompt(e.target.value)}
        placeholder={copy.placeholder} maxLength={2000} required rows={3}
        className="block min-h-24 w-full resize-y rounded-2xl border border-border bg-background/80 px-4 py-3 leading-relaxed outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-accent-ring focus-visible:shadow-[0_0_0_4px_var(--accent-soft)] sm:min-h-32"
      />
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <MotionButton type="button" variant="chip" disabled={busy} onClick={() => { setPrompt(EXAMPLE); input.current?.focus(); trackEvent("example_selected"); }}>
          <Sparkles size={13} aria-hidden /> {copy.exampleChip}
        </MotionButton>
      </div>
      <MotionButton type="submit" variant="accent" className="group mt-3 min-h-12 w-full text-[15px]" disabled={busy || !prompt.trim()}>
        {busy
          ? <><LoaderCircle size={17} className="animate-spin" aria-hidden /> {copy.ctaBusy}</>
          : <>{copy.cta} <span className="flex size-6 items-center justify-center rounded-full bg-accent text-foreground transition-transform duration-200 group-hover:translate-x-0.5"><ArrowRight size={14} aria-hidden /></span></>}
      </MotionButton>
      <p className="mt-2.5 text-center text-xs text-muted-foreground">{copy.reassurance}</p>
    </m.form>

    <div aria-live="polite" aria-atomic="true" className="mt-3 min-h-5 px-1 text-sm text-muted-foreground">{busy ? copy.busyStatus : error}</div>

    <AnimatePresence initial={false}>
      {(output || busy) && <m.section
        key="result" ref={result} aria-label={copy.resultLabel}
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
        className="mt-3 scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_30px_60px_-40px_rgb(10_10_11/0.3)] sm:p-7"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl leading-none">{copy.resultTitle}</h2>
          <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1">
            <span aria-hidden className={`size-1.5 rounded-full ${busy ? "status-dot bg-accent" : mode === "demo" ? "bg-amber-500" : "bg-emerald-500"}`} />
            {statusLabel}
          </span>
        </div>
        <div className="break-anywhere whitespace-pre-wrap text-[15px] leading-7">
          {output || <span className="text-muted-foreground">{copy.resultPlaceholder}</span>}
          {busy && <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-accent" />}
        </div>
        <AnimatePresence>
          {!busy && <m.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="mt-6 border-t border-border pt-5"><ShareButton /></m.div>}
        </AnimatePresence>
      </m.section>}
    </AnimatePresence>
  </div>;
}
