import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ImageIcon, Loader2, Download, Eye, Sparkles, ImageOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/image")({ component: ImagePage });

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);

  async function loadHistory() {
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/history?tool=image", {
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
      const res = await apiFetch("/api/history/run-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          tool: "image",
          title: prompt.trim().slice(0, 50),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("AI usage limit reached. Please try again in a few seconds.");
        } else if (res.status === 408) {
          throw new Error("Image request timed out. Please try again.");
        } else if (res.status === 503) {
          throw new Error("Image service is temporarily unavailable. Please try again later.");
        }
        throw new Error(data.message || "Failed to generate image");
      }

      const finalUrl = data.image?.url || data.text;
      if (!finalUrl) throw new Error("No image URL received from server");

      setImageUrl(finalUrl);
      toast.success("Image generated successfully!");
      await loadHistory();
    } catch (e) {
      if (e.name === "AbortError") {
        toast.error("Image generation timed out. Please try again.");
      } else {
        toast.error(e.message || "Image generation failed");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload(url) {
    try {
      const resolved = resolveImageUrl(url);
      const res = await fetch(resolved);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `nexai-artwork-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(resolveImageUrl(url), "_blank");
    }
  }

  const currentResolvedUrl = resolveImageUrl(imageUrl);

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
                placeholder="e.g. A futuristic cyberpunk city at night, neon lighting, cinematic digital art..."
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
              {busy ? "Creating quantum pixels..." : "Generate Artwork"}
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
              {currentResolvedUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={currentResolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg border border-border hover:bg-white/[0.05] transition text-muted-foreground hover:text-foreground"
                    title="View Fullscreen"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDownload(imageUrl)}
                    className="p-1.5 rounded-lg border border-border hover:bg-white/[0.05] transition text-muted-foreground hover:text-foreground"
                    title="Download Image"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 w-full flex items-center justify-center">
              {currentResolvedUrl ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={currentResolvedUrl}
                  alt="AI Generated Artwork"
                  className="max-h-[320px] rounded-xl object-contain border border-border/50 shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
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
                {history.map((item) => {
                  const itemUrl = resolveImageUrl(item.output);
                  return (
                    <div
                      key={item._id}
                      onClick={() => setImageUrl(item.output)}
                      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-border/50 bg-black/20 hover:scale-[1.03] hover:border-accent/40 transition-all shadow"
                      title={item.title}
                    >
                      <img
                        src={itemUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23666'><rect width='100%' height='100%' fill='%23111'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888' font-size='12'>Image</text></svg>";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center">
                        <span className="text-white text-xs font-medium px-2 text-center line-clamp-2">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

