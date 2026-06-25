import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Markdown, CopyButton } from "@/components/Markdown";
import { apiFetch } from "@/lib/api";

export function ToolPage({
  title,
  tool,
  system,
  placeholder,
  inputLabel,
  extraFields,
  buildPrompt,
  multiline = true,
}) {
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!input.trim() || busy) return;
    setBusy(true);
    setOut("");
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/history/run-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: buildPrompt ? buildPrompt(input) : input,
          system,
          tool,
          title: input.slice(0, 80),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AI request failed");
      setOut(data.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title={title}>
      <div className="mx-auto max-w-4xl grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5 space-y-3">
          <label className="text-sm font-medium">{inputLabel ?? "Input"}</label>
          {multiline ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={10}
              className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-h-[240px]"
            />
          ) : (
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          )}
          {extraFields}
          <button
            onClick={go}
            disabled={busy || !input.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground glow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
            {busy ? "Generating…" : "Generate"}
          </button>
        </div>

        <motion.div layout className="glass rounded-2xl p-5 min-h-[300px]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Result</div>
            {out && <CopyButton text={out} />}
          </div>
          {busy && !out && (
            <div className="space-y-2">
              <div className="h-3 shimmer rounded" />
              <div className="h-3 shimmer rounded w-4/5" />
              <div className="h-3 shimmer rounded w-3/5" />
            </div>
          )}
          {out ? (
            <Markdown content={out} />
          ) : (
            !busy && (
              <div className="text-sm text-muted-foreground">
                Your generated output will appear here.
              </div>
            )
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
