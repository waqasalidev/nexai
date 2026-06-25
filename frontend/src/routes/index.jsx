import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  FileText,
  FileSearch,
  FileSignature,
  Languages,
  Mail,
  Code2,
  Image as ImageIcon,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import { HeroScene } from "@/components/HeroScene";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NexAI — Your Ultimate AI Workspace" },
      {
        name: "description",
        content:
          "Chat, create, analyze, summarize and build with one premium AI platform combining the best of ChatGPT, Claude, Notion AI and Perplexity.",
      },
      { property: "og:title", content: "NexAI — Your Ultimate AI Workspace" },
      { property: "og:description", content: "All your AI tools in one futuristic platform." },
    ],
  }),
  component: Landing,
});

const TOOLS = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Streaming GPT-class conversations with full history.",
    to: "/chat",
  },
  {
    icon: FileSearch,
    title: "PDF Analyzer",
    desc: "Drop a PDF, ask anything, get summaries.",
    to: "/pdf",
  },
  {
    icon: FileText,
    title: "Notes Summarizer",
    desc: "Turn long notes into bullets & study guides.",
    to: "/notes",
  },
  {
    icon: FileSignature,
    title: "Resume Builder",
    desc: "Craft ATS-friendly resumes in seconds.",
    to: "/resume",
  },
  {
    icon: Mail,
    title: "Cover Letter",
    desc: "Tailored cover letters per role.",
    to: "/cover-letter",
  },
  {
    icon: Languages,
    title: "Translator",
    desc: "6 languages with tone control.",
    to: "/translate",
  },
  {
    icon: Code2,
    title: "Code Assistant",
    desc: "Generate, explain, fix and convert code.",
    to: "/code",
  },
  {
    icon: ImageIcon,
    title: "Image Generator",
    desc: "Premium AI art from a prompt.",
    to: "/image",
  },
];

const FEATURES = [
  { icon: Zap, title: "Lightning streaming", desc: "Tokens stream as fast as the model thinks." },
  { icon: Shield, title: "Private by default", desc: "Your data is encrypted and yours alone." },
  { icon: Layers, title: "One unified workspace", desc: "Every AI tool, one premium UI." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative isolate min-h-[100svh] flex items-center">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 -z-10">
          <HeroScene />
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
              Powered by next-gen frontier models
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
            >
              Your Ultimate <br />
              <span className="gradient-text">AI Workspace</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
            >
              Chat, create, analyze, learn and build — all in one premium platform. NexAI brings
              together the best of conversational AI, document intelligence and creative tools.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-sm font-semibold text-primary-foreground glow transition hover:scale-[1.02]"
              >
                Start Using AI{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#tools"
                className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3.5 text-sm font-semibold hover:bg-white/[0.08] transition"
              >
                Explore Features
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center gap-6 text-xs text-muted-foreground"
            >
              <div>
                <span className="text-foreground font-semibold text-base">12+</span> AI tools
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-foreground font-semibold text-base">∞</span> possibilities
              </div>
              <div className="h-4 w-px bg-border" />
              <div>
                <span className="text-foreground font-semibold text-base">0ms</span> setup
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block h-[600px]" />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-7 neon-border"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center mb-4">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              One platform.
              <br />
              <span className="gradient-text">Every AI tool.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Stop juggling tabs. NexAI brings every essential AI workflow under one premium
              interface.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/auth"
                  className="group block h-full glass rounded-2xl p-6 hover:bg-white/[0.07] transition hover:-translate-y-1"
                >
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center mb-4 glow-sm">
                    <t.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Simple, <span className="gradient-text">scalable pricing</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start free. Upgrade when you're ready to ship.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "For exploring",
                features: ["Limited daily AI usage", "Chat & summaries", "Basic history"],
              },
              {
                name: "Pro",
                price: "$19",
                desc: "For creators",
                features: [
                  "Unlimited AI chat",
                  "PDF analyzer",
                  "Resume builder",
                  "Image generation",
                ],
                featured: true,
              },
              {
                name: "Premium",
                price: "$49",
                desc: "For power users",
                features: ["Everything unlocked", "Priority models", "Team features", "API access"],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-7 ${p.featured ? "glass-strong neon-border glow" : "glass"}`}
              >
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{p.desc}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground text-sm">/mo</span>
                </div>
                <div className="mt-1 text-lg font-display font-semibold">{p.name}</div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`mt-7 block text-center rounded-xl px-4 py-3 text-sm font-semibold transition ${p.featured ? "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90" : "glass hover:bg-white/[0.08]"}`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10 px-6 text-center text-sm text-muted-foreground">
        <div className="font-display">
          <span className="gradient-text font-bold">NexAI</span> — The future of work, today.
        </div>
      </footer>
    </div>
  );
}
