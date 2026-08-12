import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FileSearch,
  FileText,
  FileSignature,
  Mail,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Languages,
  Code2,
  Image as ImageIcon,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/chat", icon: MessageSquare, label: "AI Chat" },
  { to: "/pdf", icon: FileSearch, label: "PDF Analyzer" },
  { to: "/notes", icon: FileText, label: "Notes" },
  { to: "/resume", icon: FileSignature, label: "Resume" },
  { to: "/cover-letter", icon: Mail, label: "Cover Letter" },
  { to: "/translate", icon: Languages, label: "Translate" },
  { to: "/code", icon: Code2, label: "Code" },
  { to: "/image", icon: ImageIcon, label: "Image" },
];

export function AppShell({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Body scroll lock when mobile drawer is active
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileDrawerOpen]);

  async function signOut() {
    logout();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col glass-strong border-r border-border/50 p-4 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 mb-4 cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow-sm">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">
            Nex<span className="gradient-text">AI</span>
          </span>
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => {
            const active = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground font-medium border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-xl glass p-3 border border-border/40">
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <button
            onClick={signOut}
            className="mt-2.5 w-full flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-destructive transition cursor-pointer min-h-[36px]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between glass-strong px-4 py-3 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold">
            Nex<span className="gradient-text">AI</span>
          </span>
        </Link>

        {title && <span className="text-xs font-semibold text-muted-foreground truncate max-w-[150px]">{title}</span>}

        <button
          onClick={() => setMobileDrawerOpen(true)}
          aria-label="Open Workspace Navigation"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 glass-strong p-5 border-r border-border/50 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
                  <Link
                    to="/"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow-sm">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-display font-bold">
                      Nex<span className="gradient-text">AI</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label="Close Navigation"
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {NAV.map((n) => {
                    const active = location.pathname === n.to;
                    return (
                      <Link
                        key={n.to}
                        to={n.to}
                        onClick={() => setMobileDrawerOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition cursor-pointer min-h-[44px] ${
                          active
                            ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground font-semibold border border-primary/30"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                        }`}
                      >
                        <n.icon className="h-4 w-4" />
                        {n.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-border/40 mt-6">
                <div className="text-xs text-muted-foreground truncate mb-3 px-1">{user?.email}</div>
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive/15 border border-destructive/30 py-3 text-xs font-semibold text-destructive hover:bg-destructive/25 transition cursor-pointer min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Page Body */}
      <main className="flex-1 min-w-0">
        {title && (
          <div className="hidden md:block border-b border-border/50 px-6 py-5">
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl font-bold"
            >
              {title}
            </motion.h1>
          </div>
        )}
        <div className="px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
