"use client";
import { useRef, useState } from "react";
import { ArrowRight, Sparkles, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { trackEvent } from "@/lib/analytics";
import { DEMO_RESULT, EXAMPLE, type GenerationChunk } from "@/lib/generation";

export function Generator() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [error, setError] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const running = useRef(false);
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
  return <div className="min-w-0">
    <form onSubmit={generate} className="rounded-2xl border border-border bg-white p-5 shadow-xs sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><label htmlFor="idea" className="text-sm font-semibold">What are you building?</label><span className="eyebrow text-muted-foreground">01 / Your idea</span></div>
      <textarea ref={input} id="idea" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="An idea, a problem, a half-formed thought…" maxLength={2000} required rows={5} className="w-full resize-y rounded-lg border border-border bg-background p-4 leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-lime-700" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" disabled={busy} onClick={() => { setPrompt(EXAMPLE); input.current?.focus(); trackEvent("example_selected"); }}><Sparkles size={14} /> Try Example</Button>
        <span className="text-xs text-muted-foreground">{prompt.length.toLocaleString()} / 2,000</span>
      </div>
      <Button type="submit" variant="accent" className="mt-6 w-full" disabled={busy || !prompt.trim()}>{busy ? <><LoaderCircle size={17} className="animate-spin" /> Making your plan…</> : <>Make my launch plan <ArrowRight size={17} /></>}</Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">No account. No setup. Just a useful next step.</p>
    </form>
    <div aria-live="polite" aria-atomic="true" className="mt-5 text-sm text-muted-foreground">{busy ? "Building your first-user launch plan…" : error}</div>
    {(output || busy) && <section aria-label="Your launch plan" className="mt-5 rounded-2xl border border-border bg-muted p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap justify-between gap-2"><h2 className="font-semibold">Your next move</h2><span className="eyebrow">{busy ? "Streaming" : mode === "demo" ? "Saved demo example" : "Made for your idea"}</span></div>
      <div className="break-anywhere whitespace-pre-wrap text-sm leading-7">{output || "Finding a useful place to start…"}</div>
      {!busy && <div className="mt-6 border-t border-border pt-5"><ShareButton /></div>}
    </section>}
  </div>;
}
