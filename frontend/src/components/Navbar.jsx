import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl glass px-5 py-3 mx-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent glow-sm grid place-items-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Nex<span className="gradient-text">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">
            Features
          </a>
          <a href="#tools" className="hover:text-foreground transition">
            Tools
          </a>
          <a href="#pricing" className="hover:text-foreground transition">
            Pricing
          </a>
          <Link to="/contact" className="hover:text-foreground transition">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Open Workspace
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
