import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  MessageSquare,
  FileSearch,
  FileText,
  FileSignature,
  Mail,
  Languages,
  Code2,
  Image as ImageIcon,
  ArrowRight,
  User,
  CreditCard,
  History,
  FileCode,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const TOOLS = [
  { to: "/chat", icon: MessageSquare, title: "AI Chat", desc: "Conversational AI with memory" },
  { to: "/pdf", icon: FileSearch, title: "PDF Analyzer", desc: "Ask questions about any PDF" },
  { to: "/notes", icon: FileText, title: "Notes Summarizer", desc: "Bullets, summaries, study notes" },
  { to: "/resume", icon: FileSignature, title: "Resume Builder", desc: "ATS-friendly resumes" },
  { to: "/cover-letter", icon: Mail, title: "Cover Letter", desc: "Tailored to any role" },
  { to: "/translate", icon: Languages, title: "Translator", desc: "6 languages, tone control" },
  { to: "/code", icon: Code2, title: "Code Assistant", desc: "Generate, fix, explain" },
  { to: "/image", icon: ImageIcon, title: "Image Generator", desc: "Premium AI art" },
];

function Dashboard() {
  const { user } = useAuth();
  const name = user?.name || user?.email?.split("@")[0] || "there";
  
  const [activeTab, setActiveTab] = useState("tools");
  const [workspaceData, setWorkspaceData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function loadWorkspaceData() {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/history", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch workspace records");
      const data = await res.json();
      setWorkspaceData(data);
    } catch (err) {
      console.error(err);
      toast.error("Error loading workspace data");
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    if (activeTab === "library") {
      loadWorkspaceData();
    }
  }, [activeTab]);

  return (
    <AppShell title={`Welcome back, ${name}`}>
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-2 print:hidden">
          <button
            onClick={() => setActiveTab("tools")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "tools"
                ? "bg-primary/20 text-foreground border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Explore Tools
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === "library"
                ? "bg-primary/20 text-foreground border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Workspace Library
          </button>
        </div>

        {activeTab === "tools" ? (
          <div>
            <p className="text-muted-foreground -mt-2 mb-8">
              Pick a tool to get started. Your generations are saved automatically.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOLS.map((t, i) => (
                <motion.div
                  key={t.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={t.to}
                    className="group block glass rounded-2xl p-6 hover:bg-white/[0.07] transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center glow-sm">
                        <t.icon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
                    </div>
                    <h3 className="mt-4 font-display font-semibold">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Top Cards: Profile & Usage Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile card */}
              <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" /> Profile Settings
                </h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between border-b border-border/20 pb-1.5">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{user?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/20 pb-1.5">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium truncate max-w-[160px]" title={user?.email}>{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize text-accent">{user?.role || "User"}</span>
                  </div>
                </div>
              </div>

              {/* Billing card */}
              <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Active Plan
                </h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between border-b border-border/20 pb-1.5">
                    <span className="text-muted-foreground">Subscription:</span>
                    <span className="font-semibold uppercase tracking-wider text-primary">
                      {user?.plan || "Free"} Plan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clearance level:</span>
                    <span className="font-medium text-muted-foreground">Standard</span>
                  </div>
                </div>
              </div>

              {/* Usage Count card */}
              <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent" /> Workspace Stats
                </h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between border-b border-border/20 pb-1.5">
                    <span className="text-muted-foreground">Total Generated Items:</span>
                    <span className="font-semibold">{workspaceData?.summary?.totalItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Requests Logged:</span>
                    <span className="font-semibold">{workspaceData?.summary?.aiUsageCount || 0} runs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Lists grouped by category */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Documents & Resumes */}
              <div className="space-y-6">
                {/* Resumes */}
                <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-primary" /> Generated Resumes
                  </h3>
                  {loadingHistory ? (
                    <div className="text-xs text-muted-foreground py-4 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Loading resumes...
                    </div>
                  ) : !workspaceData?.resumes?.length ? (
                    <div className="text-xs text-muted-foreground py-2">No generated resumes found.</div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {workspaceData.resumes.map((r) => (
                        <Link
                          key={r._id}
                          to="/resume"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/30 hover:bg-white/[0.05] transition text-xs"
                        >
                          <span className="font-medium truncate max-w-[70%]">{r.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(r.updatedAt).toLocaleDateString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* PDF Analyses */}
                <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-accent" /> PDF Documents
                  </h3>
                  {loadingHistory ? (
                    <div className="text-xs text-muted-foreground py-4 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Loading files...
                    </div>
                  ) : !workspaceData?.documents?.length ? (
                    <div className="text-xs text-muted-foreground py-2">No analyzed documents found.</div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {workspaceData.documents.map((d) => (
                        <Link
                          key={d._id}
                          to="/pdf"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/30 hover:bg-white/[0.05] transition text-xs"
                        >
                          <span className="font-medium truncate max-w-[75%]">{d.fileName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {(d.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Presentations & Chats */}
              <div className="space-y-6">
                {/* Presentations */}
                <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-accent" /> Presentations
                  </h3>
                  {loadingHistory ? (
                    <div className="text-xs text-muted-foreground py-4 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" /> Loading presentations...
                    </div>
                  ) : !workspaceData?.presentations?.length ? (
                    <div className="text-xs text-muted-foreground py-2">No presentations found.</div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {workspaceData.presentations.map((p) => (
                        <Link
                          key={p._id}
                          to="/presentation"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/30 hover:bg-white/[0.05] transition text-xs"
                        >
                          <span className="font-medium truncate max-w-[70%]">{p.topic}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {p.slides?.length} slides
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chats */}
                <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Active Chats
                  </h3>
                  {loadingHistory ? (
                    <div className="text-xs text-muted-foreground py-4 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Loading chats...
                    </div>
                  ) : !workspaceData?.chats?.length ? (
                    <div className="text-xs text-muted-foreground py-2">No chat threads found.</div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {workspaceData.chats.map((c) => (
                        <Link
                          key={c._id}
                          to="/chat"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-border/30 hover:bg-white/[0.05] transition text-xs"
                        >
                          <span className="font-medium truncate max-w-[70%]">{c.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.updatedAt).toLocaleDateString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
