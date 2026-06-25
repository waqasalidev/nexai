import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Mail, MessageSquare, Shield, Globe } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");

      toast.success("Thank you! Your message has been sent to our team.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Contact Information */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Get in <span className="gradient-text">touch</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              Have questions about NexAI? Our neural systems are ready to process your signals. Reach out for support, partnerships, or API enterprise requests.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 text-sm"
          >
            <div className="flex items-center gap-3 glass p-3.5 rounded-xl border border-border/40">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <h4 className="font-semibold text-foreground">Email Channels</h4>
                <p className="text-xs text-muted-foreground">contact@nexai.io</p>
              </div>
            </div>

            <div className="flex items-center gap-3 glass p-3.5 rounded-xl border border-border/40">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold text-foreground">Community Support</h4>
                <p className="text-xs text-muted-foreground">discord.gg/nexai-hq</p>
              </div>
            </div>

            <div className="flex items-center gap-3 glass p-3.5 rounded-xl border border-border/40">
              <Globe className="h-5 w-5 text-accent" />
              <div>
                <h4 className="font-semibold text-foreground">Global Office</h4>
                <p className="text-xs text-muted-foreground">San Francisco, CA</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-strong rounded-3xl p-8 neon-border shadow-2xl space-y-5"
        >
          <h2 className="font-display text-xl font-bold">Transmit Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl bg-input border border-border px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full rounded-xl bg-input border border-border px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Topic of Inquiry"
                className="w-full rounded-xl bg-input border border-border px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Transmit your message details here..."
                rows={5}
                className="w-full rounded-xl bg-input border border-border px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/40 text-foreground resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:scale-[1.01] transition shadow-lg disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {busy ? "Transmitting..." : "Send Signals"}
            </button>
          </form>
        </motion.div>
      </div>

      <footer className="border-t border-border/50 py-10 px-6 text-center text-sm text-muted-foreground print:hidden">
        <div className="font-display">
          <span className="gradient-text font-bold">NexAI</span> — The future of work, today.
        </div>
      </footer>
    </div>
  );
}
