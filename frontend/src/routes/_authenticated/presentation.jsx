import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Play, ChevronLeft, ChevronRight, Save, Plus, Trash2, BookOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/presentation")({ component: PresentationPage });

function PresentationPage() {
  const [presentations, setPresentations] = useState([]);
  const [activePresId, setActivePresId] = useState(null);
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  async function loadPresentations() {
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/presentations", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load presentations");
      const data = await res.json();
      setPresentations(data.presentations || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadPresentations();
  }, []);

  async function selectPresentation(pres) {
    if (!pres) {
      setActivePresId(null);
      setSlides([]);
      setCurrentSlideIndex(0);
      return;
    }
    setActivePresId(pres._id);
    setTopic(pres.topic);
    setSlides(pres.slides || []);
    setCurrentSlideIndex(0);
  }

  async function generate() {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setSlides([]);
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch("/api/presentations/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ topic, slideCount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate presentation");

      setSlides(data.presentation.slides || []);
      setActivePresId(data.presentation._id);
      setCurrentSlideIndex(0);
      toast.success("Presentation generated!");
      loadPresentations();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function deletePres(id, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this presentation?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(`/api/presentations/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to delete presentation");
      toast.success("Presentation deleted");
      if (activePresId === id) {
        selectPresentation(null);
      }
      loadPresentations();
    } catch (err) {
      toast.error(err.message);
    }
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <AppShell title="AI Presentation Generator">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Side: Creation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* History */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold">Presentations</span>
              <button
                onClick={() => selectPresentation(null)}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> New Deck
              </button>
            </div>
            {presentations.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No saved presentation decks.</div>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {presentations.map((p) => {
                  const active = p._id === activePresId;
                  return (
                    <div
                      key={p._id}
                      onClick={() => selectPresentation(p)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition ${
                        active ? "bg-primary/20 text-foreground border border-primary/30" : "bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground"
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">{p.topic}</span>
                      <button
                        onClick={(e) => deletePres(p._id, e)}
                        className="hover:text-destructive p-0.5 rounded transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Creation Panel */}
          <div className="glass rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" /> Topic Settings
            </h3>
            
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Presentation Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. History of Space Exploration, Intro to Quantum Physics..."
                className="w-full rounded-xl bg-input border border-border px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Number of Slides</span>
                <span className="text-accent">{slideCount} slides</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value))}
                className="w-full accent-primary bg-input rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <button
              onClick={generate}
              disabled={generating || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:scale-[1.01] transition shadow-lg"
            >
              {generating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {generating ? "Crafting Slides (may take 15s)..." : "Generate Slide Deck"}
            </button>
          </div>
        </div>

        {/* Right Side: Slides Previewer */}
        <div className="lg:col-span-3 space-y-6">
          {slides.length > 0 ? (
            <div className="space-y-6">
              {/* Slide Screen */}
              <div className="relative aspect-[16/9] w-full glass rounded-3xl p-8 bg-card/90 flex flex-col justify-between overflow-hidden shadow-2xl border border-border/50">
                {/* Visual Glow elements */}
                <div className="absolute top-0 right-0 h-40 w-40 bg-accent/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 h-40 w-40 bg-primary/10 rounded-full blur-[80px]" />

                {/* Top slide metadata */}
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 select-none">
                  <span>NexAI Presenter</span>
                  <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
                </div>

                {/* Main slide content with Framer Motion slide effect */}
                <div className="flex-1 flex flex-col justify-center my-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlideIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold font-display leading-tight gradient-text">
                        {currentSlide.title}
                      </h2>
                      <ul className="space-y-2.5">
                        {currentSlide.content?.map((bullet, i) => (
                          <li key={i} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0 animate-pulse-glow" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom slide controls */}
                <div className="flex justify-between items-center shrink-0 select-none border-t border-border/30 pt-4">
                  <span className="text-[10px] text-muted-foreground truncate max-w-[70%]">{topic}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={prevSlide}
                      disabled={currentSlideIndex === 0}
                      className="h-8 w-8 rounded-lg bg-white/[0.03] border border-border/60 hover:bg-white/[0.08] disabled:opacity-30 grid place-items-center transition"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextSlide}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="h-8 w-8 rounded-lg bg-white/[0.03] border border-border/60 hover:bg-white/[0.08] disabled:opacity-30 grid place-items-center transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Speaker Notes */}
              <div className="glass rounded-2xl p-5 space-y-2.5">
                <h4 className="text-xs font-semibold flex items-center gap-1.5 text-accent">
                  <BookOpen className="h-3.5 w-3.5" /> Speaker Presentation Notes
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed italic bg-black/10 p-3.5 rounded-xl border border-border/30">
                  {currentSlide.speakerNotes || "No notes for this slide."}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl aspect-[16/9] w-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground border border-border/40">
              <Play className="h-10 w-10 text-accent/50 animate-pulse mb-3" />
              <h3 className="font-semibold text-lg text-foreground">Interactive Screen Ready</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Enter a topic on the left and generate a slide deck to preview your interactive presentation.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
