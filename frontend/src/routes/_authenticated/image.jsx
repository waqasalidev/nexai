import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ImageIcon, Loader2, Download, Eye, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/image")({ component: ImagePage });

function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/history?tool=image", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load image history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function generate() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setImageUrl("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/history/run-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt,
          tool: "image",
          title: prompt.slice(0, 50),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate image");
      
      // The output text contains the generated image URL
      setImageUrl(data.text);
      toast.success("Image generated successfully!");
      loadHistory();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="AI Image Generator">
      <div className="mx-auto max-w-5xl grid lg:grid-cols-5 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Prompt Settings
            </h2>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Describe your image</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. A cyberpunk wizard reading ancient scrolls in a neon-lit library, digital art..."
                rows={5}
                className="w-full rounded-xl bg-input border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 min-h-[120px] resize-none"
              />
            </div>

            <button
              onClick={generate}
              disabled={busy || !prompt.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground glow-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] transition"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {busy ? "Generating (may take 10s)..." : "Generate Artwork"}
            </button>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass rounded-2xl p-5 min-h-[380px] flex flex-col justify-between items-center relative overflow-hidden">
            {busy && (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
                <span className="text-sm font-medium text-foreground">Creating quantum pixels...</span>
              </div>
            )}

            <div className="w-full flex items-center justify-between mb-4 border-b border-border/30 pb-3 shrink-0">
              <span className="text-sm font-medium">Render Preview</span>
              {imageUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:bg-white/[0.05] transition text-muted-foreground hover:text-foreground"
                    title="View Fullscreen"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={imageUrl}
                    download="nexai-generation.jpg"
                    className="p-1.5 rounded-lg border border-border hover:bg-white/[0.05] transition text-muted-foreground hover:text-foreground"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex-1 w-full flex items-center justify-center">
              {imageUrl ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={imageUrl}
                  alt="AI Generated Artwork"
                  className="max-h-[320px] rounded-xl object-contain border border-border/50 shadow-2xl"
                />
              ) : (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/[0.03] grid place-items-center">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div className="text-sm">Specify a prompt and click generate to begin.</div>
                </div>
              )}
            </div>
          </div>

          {/* History Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Creation Gallery</h3>
            {history.length === 0 ? (
              <div className="glass rounded-xl p-6 text-center text-xs text-muted-foreground">
                Your generated image history will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setImageUrl(item.output)}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-border/50 bg-black/20 hover:scale-[1.03] hover:border-accent/40 transition-all shadow"
                    title={item.title}
                  >
                    <img
                      src={item.output}
                      alt={item.title}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-2 text-center line-clamp-2">
                        {item.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
