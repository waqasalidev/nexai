import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
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

  async function signOut() {
    logout();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col glass-strong border-r border-border/50 p-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 mb-4">
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
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-gradient-to-r from-primary/20 to-accent/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"}`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-xl glass p-3">
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <button
            onClick={signOut}
            className="mt-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {title && (
          <div className="border-b border-border/50 px-6 py-5">
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl font-bold"
            >
              {title}
            </motion.h1>
          </div>
        )}
        <div className="px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
